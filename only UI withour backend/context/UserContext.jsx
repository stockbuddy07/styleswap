import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateId } from '../utils/helpers';

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('styleswap_users');
        if (stored) setUsers(JSON.parse(stored));
    }, []);

    const saveUsers = (updated) => {
        setUsers(updated);
        localStorage.setItem('styleswap_users', JSON.stringify(updated));
    };

    const createUser = async (userData) => {
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 400));
            const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
            if (existing) throw new Error('Email already exists');
            const newUser = { ...userData, id: generateId(), createdAt: new Date().toISOString(), status: 'active' };
            saveUsers([...users, newUser]);
            return newUser;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userId, updatedData) => {
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 400));
            const updated = users.map(u => u.id === userId ? { ...u, ...updatedData } : u);
            saveUsers(updated);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 400));
            saveUsers(users.filter(u => u.id !== userId));
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserContext.Provider value={{ users, loading, error, createUser, updateUser, deleteUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUsers() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUsers must be used within UserProvider');
    return ctx;
}
