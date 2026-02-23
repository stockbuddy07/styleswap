import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, ShoppingCart, X, ChevronDown, Store, ArrowRight, Zap, ListFilter, ArrowDownUp } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../Shared/Modal';
import Button from '../Shared/Button';
import Loader from '../Shared/Loader';
import { formatCurrency, getStockStatus, getTodayString, DEFAULT_IMAGE } from '../../utils/helpers';
import HeroCarousel from './Home/HeroCarousel';
import CategoryRail from './Home/CategoryRail';
import ProductCard from './ProductCard';
import ProductDetailsModal from './ProductDetailsModal';






export default function ProductCatalog({ searchTerm = '', selectedCategory = 'All', onCategorySelect, onRequireAuth, onProductClick }) {
    const { allProducts, loading } = useProducts();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const [sort, setSort] = useState('rating_desc');

    // Helper to handle rent click (now uses onProductClick)
    const handleRentClick = (product) => {
        if (onProductClick) {
            onProductClick(product);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleQuickAdd = (product) => {
        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const fourDaysLater = new Date(today);
        fourDaysLater.setDate(today.getDate() + 4);
        const endDate = fourDaysLater.toISOString().split('T')[0];
        const defaultSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'Free Size';
        addToCart(product, startDate, endDate, defaultSize, 1);
        addToast('Asset added to Bag', 'success');
    };

    const filtered = useMemo(() => {
        let list = allProducts.filter(p => {
            const q = searchTerm.toLowerCase();
            const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q)) || (p.shopName && p.shopName.toLowerCase().includes(q));
            const matchCat = selectedCategory === 'All' || (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

            return matchSearch && matchCat;
        });

        switch (sort) {
            case 'price_asc': list = [...list].sort((a, b) => a.pricePerDay - b.pricePerDay); break;
            case 'price_desc': list = [...list].sort((a, b) => b.pricePerDay - a.pricePerDay); break;
            case 'rating_desc': list = [...list].sort((a, b) => (b.ratings || 0) - (a.ratings || 0)); break;
            case 'newest': list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
            default: list = [...list].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        }
        return list;
    }, [allProducts, searchTerm, selectedCategory, sort]);

    return (
        <div className="bg-white min-h-screen">
            {loading && <Loader fullPage={false} message="Curating collection..." />}
            {!loading && (
                <div className="flex flex-col">
                    {/* Hero & Category Rail (Only for Home) */}
                    {!searchTerm && selectedCategory === 'All' && (
                        <div className="px-4 py-4 space-y-4">
                            <HeroCarousel onAction={onCategorySelect} />
                            <CategoryRail onSelect={onCategorySelect} selectedCategory={selectedCategory} />
                        </div>
                    )}



                    {/* Content Section */}
                    <div className="px-4 py-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                            <div className="space-y-1">
                                <h3 className="font-playfair text-4xl font-black text-midnight tracking-tighter">Discover Products</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Curated for your elegance</p>
                            </div>
                            <div className="hidden md:flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                    <span className="text-[10px] font-black text-midnight/40 uppercase tracking-widest">{filtered.length} Unique Pieces</span>
                                </div>
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center py-20">
                                <Search size={48} className="mx-auto text-gray-200 mb-4" strokeWidth={1.5} />
                                <h3 className="text-xl font-bold text-midnight mb-2">No Matching Products</h3>
                                <p className="text-gray-400 text-sm">Try adjusting your search terms</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                                {filtered.map(product => (
                                    <ProductCard key={product.id} product={product} onRent={handleRentClick} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Stats (Floating style on mobile) */}
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-midnight text-white px-6 py-3 rounded-2xl shadow-luxury flex items-center gap-4 border border-white/10 backdrop-blur-xl md:hidden">
                        <span className="text-[10px] font-black uppercase tracking-widest">{filtered.length} Discoveries</span>
                        <div className="w-px h-3 bg-white/20" />
                        <button
                            onClick={scrollToTop}
                            className="text-[10px] font-black uppercase tracking-widest text-gold"
                        >
                            Scroll Top ↑
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
