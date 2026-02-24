import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const { isAdmin, isAuthenticated } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        if (!isAdmin) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.users.list();
            setUsers(data);
        } catch (err) {
            setError(err.message);
            console.error('Fetch Users Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch users when admin status changes or on mount if already admin
    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            fetchUsers();
        } else {
            setUsers([]);
        }
    }, [isAdmin, isAuthenticated]);

    const createUser = async (userData) => {
        const user = await api.users.create(userData);
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
