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

    const fetchOrders = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const data = await api.orders.all();
                setAllOrders(data);
            } else if (isSubAdmin) {
                const data = await api.orders.vendor();
                setVendorOrders(data);
                // Also fetch all for admin analytics
                try {
                    const all = await api.orders.all();
                    setAllOrders(all);
                } catch { /* not admin, ignore */ }
            } else {
                const data = await api.orders.mine();
                setUserOrders(data);
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
        setUserOrders(prev => [order, ...prev]);
        return order;
    };

    const updateOrderStatus = async (orderId, status) => {
        const updated = await api.orders.updateStatus(orderId, status);
        setAllOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        setVendorOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        setUserOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        return updated;
    };

    const submitFeedback = async (orderId, feedbackData) => {
        const updated = await api.orders.submitFeedback(orderId, feedbackData);
        setUserOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        return updated;
    };

    const raiseIssue = async (orderId, issueData) => {
        const updated = await api.orders.raiseIssue(orderId, issueData);
        setUserOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        return updated;
    };

    const updateIssueStatus = async (orderId, issueId, status, adminResponse = null) => {
        const updated = await api.orders.updateIssue(orderId, issueId, status, adminResponse);
        setAllOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        return updated;
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
