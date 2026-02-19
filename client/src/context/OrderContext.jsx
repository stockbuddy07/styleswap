import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
    const { currentUser, isAdmin, isSubAdmin } = useAuth();
    const [allOrders, setAllOrders] = useState([]);
    const [userOrders, setUserOrders] = useState([]);
    const [vendorOrders, setVendorOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper to safely parse JSON fields that might come as strings from DB
    const parseOrder = (o) => {
        if (!o) return o;
        try {
            return {
                ...o,
                items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []),
                feedback: typeof o.feedback === 'string' ? JSON.parse(o.feedback) : (o.feedback || null),
                issues: typeof o.issues === 'string' ? JSON.parse(o.issues) : (o.issues || []),
            };
        } catch (e) {
            console.error('Failed to parse order JSON:', e, o);
            return { ...o, items: [], issues: [] };
        }
    };

    const fetchOrders = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const data = await api.orders.all();
                setAllOrders(Array.isArray(data) ? data.map(parseOrder) : []);
            } else if (isSubAdmin) {
                const data = await api.orders.vendor();
                setVendorOrders(Array.isArray(data) ? data.map(parseOrder) : []);
                // Also fetch all for admin analytics
                try {
                    const all = await api.orders.all();
                    setAllOrders(Array.isArray(all) ? all.map(parseOrder) : []);
                } catch { /* not admin, ignore */ }
            } else {
                const data = await api.orders.mine();
                setUserOrders(Array.isArray(data) ? data.map(parseOrder) : []);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [currentUser?.id, isAdmin, isSubAdmin]);

    const placeOrder = async (orderData) => {
        const order = await api.orders.place(orderData);
        const parsed = parseOrder(order);
        setUserOrders(prev => [parsed, ...prev]);
        return parsed;
    };

    const updateOrderStatus = async (orderId, status) => {
        const updated = await api.orders.updateStatus(orderId, status);
        const parsed = parseOrder(updated);
        setAllOrders(prev => prev.map(o => o.id === orderId ? parsed : o));
        setVendorOrders(prev => prev.map(o => o.id === orderId ? parsed : o));
        setUserOrders(prev => prev.map(o => o.id === orderId ? parsed : o));
        return parsed;
    };

    const submitFeedback = async (orderId, feedbackData) => {
        const updated = await api.orders.submitFeedback(orderId, feedbackData);
        const parsed = parseOrder(updated);
        setUserOrders(prev => prev.map(o => o.id === orderId ? parsed : o));
        return parsed;
    };

    const raiseIssue = async (orderId, issueData) => {
        const updated = await api.orders.raiseIssue(orderId, issueData);
        const parsed = parseOrder(updated);
        setUserOrders(prev => prev.map(o => o.id === orderId ? parsed : o));
        return parsed;
    };

    const updateIssueStatus = async (orderId, issueId, status, adminResponse = null) => {
        const updated = await api.orders.updateIssue(orderId, issueId, status, adminResponse);
        const parsed = parseOrder(updated);
        setAllOrders(prev => prev.map(o => o.id === orderId ? parsed : o));
        return parsed;
    };

    return (
        <OrderContext.Provider value={{
            allOrders, userOrders, vendorOrders, loading,
            placeOrder, updateOrderStatus, submitFeedback, raiseIssue, updateIssueStatus,
            refetch: fetchOrders,
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const ctx = useContext(OrderContext);
    if (!ctx) throw new Error('useOrders must be used within OrderProvider');
    return ctx;
}
