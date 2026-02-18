import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

/**
 * A vendor profile is "complete" when they have filled in the mandatory
 * onboarding fields: shopAddress, shopNumber, mobileNumber, salesHandlerMobile.
 */
export function isVendorProfileComplete(user) {
    if (!user || user.role !== 'Sub-Admin') return true;
    return !!(
        user.shopAddress?.trim() &&
        user.shopNumber?.trim() &&
        user.mobileNumber?.trim() &&
        user.salesHandlerMobile?.trim()
    );
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // On mount: restore user from token
    useEffect(() => {
        const token = localStorage.getItem('styleswap_token');
        const savedUser = localStorage.getItem('styleswap_currentUser');
        if (token && savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser));
                // Refresh from server in background
                api.auth.me().then(user => {
                    setCurrentUser(user);
                    localStorage.setItem('styleswap_currentUser', JSON.stringify(user));
                }).catch(() => {
                    // Token expired — clear
                    localStorage.removeItem('styleswap_token');
                    localStorage.removeItem('styleswap_currentUser');
                    setCurrentUser(null);
                });
            } catch {
                localStorage.removeItem('styleswap_currentUser');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const { user, token } = await api.auth.login(email, password);
            localStorage.setItem('styleswap_token', token);
            localStorage.setItem('styleswap_currentUser', JSON.stringify(user));
            setCurrentUser(user);
            return user;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, role, shopName = null) => {
        setLoading(true);
        setError(null);
        try {
            const { user, token } = await api.auth.register(name, email, password, role, shopName);
            localStorage.setItem('styleswap_token', token);
            localStorage.setItem('styleswap_currentUser', JSON.stringify(user));
            setCurrentUser(user);
            return user;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /** Update current user's profile fields (calls API, then updates local state) */
    const updateCurrentUser = async (updatedFields) => {
        try {
            const updated = await api.users.update(currentUser.id, updatedFields);
            setCurrentUser(updated);
            localStorage.setItem('styleswap_currentUser', JSON.stringify(updated));
            return updated;
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        setCurrentUser(null);
        setError(null);
        localStorage.removeItem('styleswap_token');
        localStorage.removeItem('styleswap_currentUser');
    };

    const isAuthenticated = !!currentUser;
    const isAdmin = currentUser?.role === 'Admin';
    const isSubAdmin = currentUser?.role === 'Sub-Admin';
    const isUser = currentUser?.role === 'User';
    const vendorProfileComplete = isVendorProfileComplete(currentUser);

    return (
        <AuthContext.Provider value={{
            currentUser,
            loading,
            error,
            login,
            register,
            logout,
            updateCurrentUser,
            isAuthenticated,
            isAdmin,
            isSubAdmin,
            isUser,
            vendorProfileComplete,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
