import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const { currentUser } = useAuth();
    const toast = useToast();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {
        if (!currentUser) {
            setWishlistItems([]);
            return;
        }
        setLoading(true);
        try {
            const data = await api.wishlist.list();
            setWishlistItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [currentUser?.id]);

    const addToWishlist = async (productId) => {
        if (!currentUser) {
            toast.info('Initiate session to curate your collection');
            return false;
        }
        try {
            const newItem = await api.wishlist.add(productId);
            setWishlistItems(prev => [newItem, ...prev]);
            toast.success('Asset added to your collection');
            return true;
        } catch (err) {
            console.error('Failed to add to wishlist:', err);
            toast.error('Manifest update failed');
            return false;
        }
    };

    const removeFromWishlist = async (id) => {
        try {
            await api.wishlist.remove(id);
            setWishlistItems(prev => prev.filter(item => item.id !== id));
            toast.success('Asset removed from collection');
            return true;
        } catch (err) {
            console.error('Failed to remove from wishlist:', err);
            toast.error('Could not modify manifest');
            return false;
        }
    };

    const toggleWishlist = async (product) => {
        if (!currentUser) {
            toast.info('Sign in to preserve your curation');
            return;
        }

        const existingItem = wishlistItems.find(item => item.productId === product.id);
        if (existingItem) {
            return await removeFromWishlist(existingItem.id);
        } else {
            return await addToWishlist(product.id);
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.productId === productId);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            loading,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isInWishlist,
            refetch: fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within WishlistProvider');
    return context;
}
