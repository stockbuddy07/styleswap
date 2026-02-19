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

    // Fetch all products (public)
    const fetchAllProducts = async () => {
        setLoading(true);
        try {
            const data = await api.products.list();
            setAllProducts(data);
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
            setMyProducts(data);
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
        setMyProducts(prev => [product, ...prev]);
        setAllProducts(prev => [product, ...prev]);
        return product;
    };

    const updateProduct = async (id, form) => {
        const updated = await api.products.update(id, form);
        setMyProducts(prev => prev.map(p => p.id === id ? updated : p));
        setAllProducts(prev => prev.map(p => p.id === id ? updated : p));
        return updated;
    };

    const deleteProduct = async (id) => {
        await api.products.delete(id);
        setMyProducts(prev => prev.filter(p => p.id !== id));
        setAllProducts(prev => prev.filter(p => p.id !== id));
    };

    const updateAvailability = async (productId, delta) => {
        try {
            const updated = await api.products.updateAvailability(productId, delta);
            setAllProducts(prev => prev.map(p => p.id === productId ? updated : p));
        } catch (err) {
            console.error('Failed to update availability:', err);
        }
    };

    // products alias for backward compat
    const products = allProducts;

    return (
        <ProductContext.Provider value={{
            allProducts, products, myProducts, loading, error,
            createProduct, updateProduct, deleteProduct, updateAvailability,
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
