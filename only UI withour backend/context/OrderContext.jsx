import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/helpers';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
    const { currentUser } = useAuth();
    const [allOrders, setAllOrders] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('styleswap_orders');
        if (stored) setAllOrders(JSON.parse(stored));
    }, []);

    const saveOrders = (updated) => {
        setAllOrders(updated);
        localStorage.setItem('styleswap_orders', JSON.stringify(updated));
    };

    const placeOrder = (orderData) => {
        const newOrder = {
            ...orderData,
            orderId: generateId(),
            customerId: currentUser.id,
            customerName: currentUser.name,
            orderDate: new Date().toISOString(),
            status: 'Active',
            feedback: null,
            issues: [],
        };
        saveOrders([...allOrders, newOrder]);
        return newOrder;
    };

    const updateOrderStatus = (orderId, status) => {
        saveOrders(allOrders.map(o => o.orderId === orderId ? { ...o, status } : o));
    };

    /** Submit or update customer feedback for an order */
    const submitFeedback = (orderId, { rating, review, tags = [] }) => {
        saveOrders(allOrders.map(o =>
            o.orderId === orderId
                ? { ...o, feedback: { rating, review, tags, submittedAt: new Date().toISOString() } }
                : o
        ));
    };

    /** Raise a new issue on an order */
    const raiseIssue = (orderId, { type, description }) => {
        const issue = {
            issueId: generateId(),
            type,
            description,
            status: 'Open',
            raisedAt: new Date().toISOString(),
            resolvedAt: null,
            adminResponse: null,
        };
        saveOrders(allOrders.map(o =>
            o.orderId === orderId
                ? { ...o, issues: [...(o.issues || []), issue] }
                : o
        ));
        return issue;
    };

    /** Update an existing issue status (admin side) */
    const updateIssueStatus = (orderId, issueId, status, adminResponse = null) => {
        saveOrders(allOrders.map(o => {
            if (o.orderId !== orderId) return o;
            return {
                ...o,
                issues: (o.issues || []).map(iss =>
                    iss.issueId === issueId
                        ? { ...iss, status, adminResponse, resolvedAt: status === 'Resolved' ? new Date().toISOString() : null }
                        : iss
                ),
            };
        }));
    };

    const getUserOrders = (userId) => allOrders.filter(o => o.customerId === userId);
    const getOrdersByVendor = (vendorId) =>
        allOrders.filter(o => o.items?.some(i => i.vendorId === vendorId));

    const userOrders = currentUser ? getUserOrders(currentUser.id) : [];
    const vendorOrders = currentUser ? getOrdersByVendor(currentUser.id) : [];

    return (
        <OrderContext.Provider value={{
            allOrders,
            userOrders,
            vendorOrders,
            placeOrder,
            updateOrderStatus,
            submitFeedback,
            raiseIssue,
            updateIssueStatus,
            getUserOrders,
            getOrdersByVendor,
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
