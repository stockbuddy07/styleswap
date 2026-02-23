import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { calculateRentalDays } from '../utils/helpers';
import { api } from '../utils/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { currentUser } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        if (!currentUser) {
            setCartItems([]);
            return;
        }
        setLoading(true);
        try {
            const items = await api.cart.list();
            // Backend returns items, we need to ensure rentalDays and subtotal are calculated if not in DB
            const enriched = items.map(item => {
                const rentalDays = calculateRentalDays(item.rentalStartDate, item.rentalEndDate);
                const subtotal = item.pricePerDay * rentalDays * item.quantity;
                const depositTotal = item.securityDeposit * item.quantity;
                return { ...item, rentalDays, subtotal, depositTotal };
            });
            setCartItems(enriched);
        } catch (err) {
            console.error('Failed to fetch manifest from DB:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (product, rentalStartDate, rentalEndDate, size, quantity) => {
        if (!currentUser) return;
        setLoading(true);
        try {
            await api.cart.add({
                productId: product.id,
                quantity,
                size,
                rentalStartDate,
                rentalEndDate
            });
            await fetchCart();
        } catch (err) {
            console.error('Failed to lock asset in manifest:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (cartItemId) => {
        setLoading(true);
        try {
            await api.cart.remove(cartItemId);
            await fetchCart();
        } catch (err) {
            console.error('Failed to release asset:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (cartItemId, newQuantity) => {
        setLoading(true);
        try {
            await api.cart.update(cartItemId, { quantity: newQuantity });
            await fetchCart();
        } catch (err) {
            console.error('Failed to update manifest quantity:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateDates = async (cartItemId, rentalStartDate, rentalEndDate) => {
        setLoading(true);
        try {
            await api.cart.update(cartItemId, { rentalStartDate, rentalEndDate });
            await fetchCart();
        } catch (err) {
            console.error('Failed to update manifest dates:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateSize = async (cartItemId, newSize) => {
        setLoading(true);
        try {
            await api.cart.update(cartItemId, { size: newSize });
            await fetchCart();
        } catch (err) {
            console.error('Failed to update manifest size:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        setLoading(true);
        try {
            await api.cart.clear();
            await fetchCart();
        } catch (err) {
            console.error('Failed to dissolve manifest:', err);
        } finally {
            setLoading(false);
        }
    };

    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const totalRentalFees = cartItems.reduce((sum, i) => sum + i.subtotal, 0);
    const totalDeposits = cartItems.reduce((sum, i) => sum + i.depositTotal, 0);
    const grandTotal = totalRentalFees + totalDeposits;

    const groupCartByVendor = () => {
        const groups = {};
        cartItems.forEach(item => {
            if (!groups[item.vendorId]) {
                groups[item.vendorId] = { shopName: item.vendorShopName, items: [] };
            }
            groups[item.vendorId].items.push(item);
        });
        return groups;
    };

    const uniqueVendorCount = Object.keys(groupCartByVendor()).length;

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            totalRentalFees,
            totalDeposits,
            grandTotal,
            uniqueVendorCount,
            loading,
            addToCart,
            removeFromCart,
            updateQuantity,
            updateDates,
            updateSize,
            clearCart,
            groupCartByVendor,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
