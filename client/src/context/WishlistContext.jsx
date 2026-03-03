import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

const GUEST_KEY = 'styleswap_guest_wishlist';

const getGuestWishlist = () => {
    try { return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]'); } catch { return []; }
};
const saveGuestWishlist = (items) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
};

export function WishlistProvider({ children }) {
    const { currentUser } = useAuth();
    const toast = useToast();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- Fetch / merge on auth change ---
    useEffect(() => {
        if (!currentUser) {
            // Guest: load from localStorage
            setWishlistItems(getGuestWishlist());
            return;
        }

        // Logged in: fetch from server then merge any guest items
        const mergeAndFetch = async () => {
            setLoading(true);
            try {
                const serverItems = await api.wishlist.list();
                const list = Array.isArray(serverItems) ? serverItems : [];

                // Merge guest wishlist items not already on server
                const guestItems = getGuestWishlist();
                const serverProductIds = new Set(list.map(i => i.productId));

                for (const gItem of guestItems) {
                    const pid = gItem.productId || gItem.id;
                    if (pid && !serverProductIds.has(pid)) {
                        try {
                            const added = await api.wishlist.add(pid);
                            list.unshift(added);
                        } catch (_) { /* skip individual failures */ }
                    }
                }

                // Clear guest list after merge
                localStorage.removeItem(GUEST_KEY);
                setWishlistItems(list);
            } catch (err) {
                console.error('Failed to fetch wishlist:', err);
            } finally {
                setLoading(false);
            }
        };

        mergeAndFetch();
    }, [currentUser?.id]);

    // --- Add ---
    const addToWishlist = async (productId) => {
        if (!currentUser) {
            // Guest: store full product id reference in localStorage
            const existing = getGuestWishlist();
            if (existing.some(i => (i.productId || i.id) === productId)) return true;
            const updated = [{ productId, id: productId }, ...existing];
            saveGuestWishlist(updated);
            setWishlistItems(updated);
            toast.success('Added to wishlist');
            return true;
        }
        try {
            const newItem = await api.wishlist.add(productId);
            setWishlistItems(prev => [newItem, ...prev]);
            toast.success('Added to wishlist');
            return true;
        } catch (err) {
            console.error('Failed to add to wishlist:', err);
            toast.error('Could not update wishlist');
            return false;
        }
    };

    // --- Remove ---
    const removeFromWishlist = async (id) => {
        if (!currentUser) {
            const updated = getGuestWishlist().filter(i => (i.productId || i.id) !== id && i.id !== id);
            saveGuestWishlist(updated);
            setWishlistItems(updated);
            toast.success('Removed from wishlist');
            return true;
        }
        try {
            await api.wishlist.remove(id);
            setWishlistItems(prev => prev.filter(item => item.id !== id));
            toast.success('Removed from wishlist');
            return true;
        } catch (err) {
            console.error('Failed to remove from wishlist:', err);
            toast.error('Could not update wishlist');
            return false;
        }
    };

    // --- Toggle (works for both guests and users) ---
    const toggleWishlist = async (product) => {
        const existingItem = wishlistItems.find(item =>
            item.productId === product.id || item.id === product.id
        );
        if (existingItem) {
            return await removeFromWishlist(existingItem.id || existingItem.productId);
        } else {
            return await addToWishlist(product.id);
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item =>
            item.productId === productId || item.id === productId
        );
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            loading,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isInWishlist,
            refetch: () => { }
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
