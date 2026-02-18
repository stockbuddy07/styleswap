import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await api.users.list();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch users on mount (admin only — API enforces this)
    useEffect(() => {
        const token = localStorage.getItem('styleswap_token');
        if (token) fetchUsers();
    }, []);

    const createUser = async (userData) => {
        // Admin creates users via the register endpoint
        const { user } = await api.auth.register(
            userData.name, userData.email, userData.password,
            userData.role, userData.shopName || null
        );
        setUsers(prev => [user, ...prev]);
        return user;
    };

    const updateUser = async (id, data) => {
        const updated = await api.users.update(id, data);
        setUsers(prev => prev.map(u => u.id === id ? updated : u));
        return updated;
    };

    const deleteUser = async (id) => {
        await api.users.delete(id);
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    const refetch = () => fetchUsers();

    return (
        <UserContext.Provider value={{ users, loading, error, createUser, updateUser, deleteUser, refetch }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUsers() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUsers must be used within UserProvider');
    return ctx;
}
