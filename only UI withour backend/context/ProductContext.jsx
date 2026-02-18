import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/helpers';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
    const { currentUser } = useAuth();
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('styleswap_products');
        if (stored) setAllProducts(JSON.parse(stored));
    }, []);

    const saveProducts = (updated) => {
        setAllProducts(updated);
        localStorage.setItem('styleswap_products', JSON.stringify(updated));
    };

    const myProducts = currentUser
        ? allProducts.filter(p => p.subAdminId === currentUser.id)
        : [];

    const createProduct = async (productData) => {
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 400));
            const newProduct = {
                ...productData,
                id: generateId(),
                subAdminId: currentUser.id,
                shopName: currentUser.shopName,
                availableQuantity: productData.stockQuantity,
                createdAt: new Date().toISOString(),
                ratings: 0,
            };
            saveProducts([...allProducts, newProduct]);
            return newProduct;
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async (productId, updatedData) => {
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 400));
            saveProducts(allProducts.map(p => p.id === productId ? { ...p, ...updatedData } : p));
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (productId) => {
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 400));
            saveProducts(allProducts.filter(p => p.id !== productId));
        } finally {
            setLoading(false);
        }
    };

    const updateAvailability = (productId, delta) => {
        saveProducts(allProducts.map(p => {
            if (p.id !== productId) return p;
            const newAvail = Math.max(0, Math.min(p.stockQuantity, p.availableQuantity + delta));
            return { ...p, availableQuantity: newAvail };
        }));
    };

    return (
        <ProductContext.Provider value={{
            allProducts,
            myProducts,
            loading,
            createProduct,
            updateProduct,
            deleteProduct,
            updateAvailability,
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
