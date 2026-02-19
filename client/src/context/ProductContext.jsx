import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
    const { currentUser, isSubAdmin } = useAuth();
    const [allProducts, setAllProducts] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper to safely parse JSON fields that might come as strings from DB
    const parseProduct = (p) => {
        if (!p) return p;
        try {
            return {
                ...p,
                images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
                sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : (p.sizes || []),
                reviews: p.reviews || [],
                description: p.description || '',
                // Ensure vendor shopName is flattened for easier UI access
                shopName: p.vendor?.shopName || p.shopName || 'Premium Store'
            };
        } catch (e) {
            console.error('Failed to parse product JSON:', e, p);
            return { ...p, images: [], sizes: [] };
        }
    };

    // Fetch all products (public)
    const fetchAllProducts = async () => {
        setLoading(true);
        try {
            const data = await api.products.list();
            setAllProducts(Array.isArray(data) ? data.map(parseProduct) : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch vendor's own products
    const fetchMyProducts = async () => {
        try {
            const data = await api.products.mine();
            setMyProducts(Array.isArray(data) ? data.map(parseProduct) : []);
        } catch (err) {
            console.error('Failed to fetch my products:', err);
        }
    };

    useEffect(() => {
        fetchAllProducts();
    }, []);

    useEffect(() => {
        if (isSubAdmin) fetchMyProducts();
    }, [isSubAdmin, currentUser?.id]);

    const createProduct = async (form) => {
        const product = await api.products.create(form);
        const parsed = parseProduct(product);
        setMyProducts(prev => [parsed, ...prev]);
        setAllProducts(prev => [parsed, ...prev]);
        return parsed;
    };

    const updateProduct = async (id, form) => {
        const updated = await api.products.update(id, form);
        const parsed = parseProduct(updated);
        setMyProducts(prev => prev.map(p => p.id === id ? parsed : p));
        setAllProducts(prev => prev.map(p => p.id === id ? parsed : p));
        return parsed;
    };

    const deleteProduct = async (id) => {
        await api.products.delete(id);
        setMyProducts(prev => prev.filter(p => p.id !== id));
        setAllProducts(prev => prev.filter(p => p.id !== id));
    };

    const updateAvailability = async (productId, delta) => {
        try {
            const updated = await api.products.updateAvailability(productId, delta);
            const parsed = parseProduct(updated);
            setAllProducts(prev => prev.map(p => p.id === productId ? parsed : p));
        } catch (err) {
            console.error('Failed to update availability:', err);
        }
    };

    const getDetailedProduct = async (id) => {
        try {
            const product = await api.products.getById(id);
            return parseProduct(product);
        } catch (err) {
            console.error('Failed to fetch detailed product:', err);
            throw err;
        }
    };

    const submitReview = async (productId, reviewData) => {
        try {
            const review = await api.products.addReview(productId, reviewData);
            // Optionally update local state if we had a single product state
            // For now, we refetch all to keep it sync (or just return for local update)
            await fetchAllProducts();
            return review;
        } catch (err) {
            console.error('Failed to submit review:', err);
            throw err;
        }
    };

    // products alias for backward compat
    const products = allProducts;

    return (
        <ProductContext.Provider value={{
            allProducts, products, myProducts, loading, error,
            createProduct, updateProduct, deleteProduct, updateAvailability,
            getDetailedProduct, submitReview,
            refetch: fetchAllProducts,
        }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const ctx = useContext(ProductContext);
    if (!ctx) throw new Error('useProducts must be used within ProductProvider');
    return ctx;
}
