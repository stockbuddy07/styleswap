import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { generateId, calculateRentalDays } from '../utils/helpers';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { currentUser } = useAuth();
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        if (currentUser) {
            const key = `styleswap_cart_${currentUser.id}`;
            const stored = localStorage.getItem(key);
            try {
                setCartItems(stored ? JSON.parse(stored) : []);
            } catch (e) {
                console.error('Failed to parse cart JSON:', e);
                setCartItems([]);
                localStorage.removeItem(key);
            }
        } else {
            setCartItems([]);
        }
    }, [currentUser]);

    const saveCart = (items) => {
        setCartItems(items);
        if (currentUser) {
            localStorage.setItem(`styleswap_cart_${currentUser.id}`, JSON.stringify(items));
        }
    };

    const addToCart = (product, rentalStartDate, rentalEndDate, size, quantity) => {
        const rentalDays = calculateRentalDays(rentalStartDate, rentalEndDate);
        const subtotal = product.pricePerDay * rentalDays * quantity;
        const depositTotal = product.securityDeposit * quantity;
        const cartItem = {
            id: generateId(),
            productId: product.id,
            productName: product.name,
            productImage: product.images?.[0] || '',
            category: product.category,
            vendorId: product.subAdminId,
            vendorShopName: product.shopName,
            pricePerDay: product.pricePerDay,
            securityDeposit: product.securityDeposit,
            size,
            quantity,
            rentalStartDate,
            rentalEndDate,
            rentalDays,
            subtotal,
            depositTotal,
        };
        saveCart([...cartItems, cartItem]);
    };

    const removeFromCart = (cartItemId) => {
        saveCart(cartItems.filter(i => i.id !== cartItemId));
    };

    const updateQuantity = (cartItemId, newQuantity) => {
        saveCart(cartItems.map(i => {
            if (i.id !== cartItemId) return i;
            const subtotal = i.pricePerDay * i.rentalDays * newQuantity;
            const depositTotal = i.securityDeposit * newQuantity;
            return { ...i, quantity: newQuantity, subtotal, depositTotal };
        }));
    };

    const updateDates = (cartItemId, rentalStartDate, rentalEndDate) => {
        saveCart(cartItems.map(i => {
            if (i.id !== cartItemId) return i;
            const rentalDays = calculateRentalDays(rentalStartDate, rentalEndDate);
            const subtotal = i.pricePerDay * rentalDays * i.quantity;
            return { ...i, rentalStartDate, rentalEndDate, rentalDays, subtotal };
        }));
    };

    const updateSize = (cartItemId, newSize) => {
        saveCart(cartItems.map(i => i.id !== cartItemId ? i : { ...i, size: newSize }));
    };

    const clearCart = () => saveCart([]);

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
