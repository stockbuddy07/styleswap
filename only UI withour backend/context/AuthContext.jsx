import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeMockData } from '../utils/mockData';
import { validateEmail, generateId } from '../utils/helpers';

const AuthContext = createContext(null);

/**
 * A vendor profile is "complete" when they have filled in the mandatory
 * onboarding fields: shopAddress, shopNumber, mobileNumber, salesHandlerMobile.
 */
export function isVendorProfileComplete(user) {
    if (!user || user.role !== 'Sub-Admin') return true; // non-vendors always pass
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

    useEffect(() => {
        initializeMockData();
        const savedUser = localStorage.getItem('styleswap_currentUser');
        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser));
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
            await new Promise(r => setTimeout(r, 600));
            const users = JSON.parse(localStorage.getItem('styleswap_users') || '[]');
            const user = users.find(
                u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );
            if (!user) throw new Error('Invalid email or password');
            const { password: _, ...safeUser } = user;
            setCurrentUser(safeUser);
            localStorage.setItem('styleswap_currentUser', JSON.stringify(safeUser));
            return safeUser;
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
            await new Promise(r => setTimeout(r, 600));
            if (!validateEmail(email)) throw new Error('Invalid email format');
            if (password.length < 6) throw new Error('Password must be at least 6 characters');

            const users = JSON.parse(localStorage.getItem('styleswap_users') || '[]');
            const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (exists) throw new Error('An account with this email already exists');

            const newUser = {
                id: generateId(),
                name,
                email,
                password,
                role,
                shopName: role === 'Sub-Admin' ? shopName : null,
                createdAt: new Date().toISOString(),
                status: 'active',
                avatar: null,
                // Vendor profile fields (filled during onboarding)
                shopAddress: null,
                shopNumber: null,
                mobileNumber: null,
                salesHandlerMobile: null,
                gstNumber: null,
            };
            users.push(newUser);
            localStorage.setItem('styleswap_users', JSON.stringify(users));

            // Auto-login after registration
            const { password: _, ...safeUser } = newUser;
            setCurrentUser(safeUser);
            localStorage.setItem('styleswap_currentUser', JSON.stringify(safeUser));

            return safeUser;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /** Update current user's profile fields (persists to users list + currentUser) */
    const updateCurrentUser = (updatedFields) => {
        const users = JSON.parse(localStorage.getItem('styleswap_users') || '[]');
        const updated = users.map(u =>
            u.id === currentUser.id ? { ...u, ...updatedFields } : u
        );
        localStorage.setItem('styleswap_users', JSON.stringify(updated));

        const updatedUser = { ...currentUser, ...updatedFields };
        setCurrentUser(updatedUser);
        localStorage.setItem('styleswap_currentUser', JSON.stringify(updatedUser));
        return updatedUser;
    };

    const logout = () => {
        setCurrentUser(null);
        setError(null);
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
