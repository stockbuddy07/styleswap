import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, ShoppingCart, X, ChevronDown, Store, ArrowRight, Zap } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../Shared/Modal';
import Button from '../Shared/Button';
import Loader from '../Shared/Loader';
import { formatCurrency, getStockStatus, getTodayString, DEFAULT_IMAGE } from '../../utils/helpers';
import HeroCarousel from './Home/HeroCarousel';
import CategoryRail from './Home/CategoryRail';
import ProductCard from './ProductCard'; // Correct import path

import ProductDetailsModal from './ProductDetailsModal';

const CATEGORIES = ['All', 'Wedding Attire', 'Blazers', 'Shoes', 'Accessories'];
const SORT_OPTIONS = [
    { value: 'name_asc', label: 'Name A–Z' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating_desc', label: 'Top Rated' },
];



export default function ProductCatalog({ searchTerm = '', selectedCategory = 'All', onCategorySelect, onRequireAuth, onProductClick }) {
    const { allProducts, loading } = useProducts();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const [sort, setSort] = useState('name_asc');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Helper to handle rent click (now uses onProductClick)
    const handleRentClick = (product) => {
        if (onProductClick) {
            onProductClick(product);
        }
    };

    const handleQuickAdd = (product) => {
        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const fourDaysLater = new Date(today);
        fourDaysLater.setDate(today.getDate() + 4);
        const endDate = fourDaysLater.toISOString().split('T')[0];

        const defaultSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'Free Size';

        addToCart(product, startDate, endDate, defaultSize, 1);
        addToast('Matrix Optimized: Asset added to your Bag.', 'success');
    };

    const isHomeView = !searchTerm && (selectedCategory === 'All' || selectedCategory === 'Great Deals');

    const filtered = useMemo(() => {
        let list = allProducts.filter(p => {
            const q = searchTerm.toLowerCase();
            const matchSearch = !q ||
                p.name.toLowerCase().includes(q) ||
                (p.category && p.category.toLowerCase().includes(q)) ||
                (p.shopName && p.shopName.toLowerCase().includes(q)) ||
                (p.description && p.description.toLowerCase().includes(q)); // Search in description

            // "Great Deals" is a sort mode, not a filter, so we treat it as 'All' for filtering
            const matchCat = selectedCategory === 'All' || selectedCategory === 'Great Deals' ||
                (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

            return matchSearch && matchCat;
        });

        // Sorting Logic
        const activeSort = selectedCategory === 'Great Deals' ? 'discount_desc' : sort;

        switch (activeSort) {
            case 'price_asc': list = [...list].sort((a, b) => a.pricePerDay - b.pricePerDay); break;
            case 'price_desc': list = [...list].sort((a, b) => b.pricePerDay - a.pricePerDay); break;
            case 'rating_desc': list = [...list].sort((a, b) => (b.ratings || 0) - (a.ratings || 0)); break;
            case 'discount_desc': list = [...list].sort((a, b) => {
                const discountA = a.retailPrice ? ((a.retailPrice - a.pricePerDay) / a.retailPrice) : 0;
                const discountB = b.retailPrice ? ((b.retailPrice - b.pricePerDay) / b.retailPrice) : 0;
                return discountB - discountA;
            }); break;
            default: list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        }
        return list;
    }, [allProducts, searchTerm, selectedCategory, sort]);

    return (
        <div className="space-y-8 pb-20">
            {loading && <Loader fullPage={false} message="Curating collection..." />}
            {!loading && (
                <>
                    {/* Hero Section (Only on Home View) */}
                    {isHomeView && (
                        <div className="space-y-4">
                            {selectedCategory !== 'Great Deals' && <HeroCarousel onAction={onCategorySelect} />}
                            <CategoryRail onSelect={onCategorySelect} selectedCategory={selectedCategory} />

                            {/* Show specific banner for Great Deals */}
                            {selectedCategory === 'Great Deals' && (
                                <div className="animate-luxury-entry stagger-1 relative overflow-hidden bg-gradient-to-r from-red-950 via-red-900 to-red-950 rounded-[2.5rem] p-12 text-white shadow-2xl border border-white/5">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                                    <div className="relative z-10 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-red-500/30">Limited Opportunity</span>
                                        </div>
                                        <h1 className="font-playfair text-6xl font-black tracking-tighter max-w-2xl leading-[0.9]">Elite Acquisitions: Exceptional Yields</h1>
                                        <p className="text-red-200/70 font-bold text-sm tracking-wide max-w-lg">Access curated luxury assets at unprecedented market rates. Verified quality, standard protocols.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between animate-luxury-entry stagger-3 px-2">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-playfair font-black text-midnight tracking-tight">Market Momentum</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Highest Demand Assets Right Now</p>
                                </div>
                                <button onClick={() => setSort('rating_desc')} className="group flex items-center gap-3 px-6 py-3 bg-midnight text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gold hover:text-midnight hover:shadow-glow transition-all duration-500">
                                    Expose All <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {!isHomeView && (
                        <div className="flex flex-col gap-6 animate-luxury-entry stagger-1 px-2">
                            <div className="flex flex-wrap items-center justify-between gap-6 w-full pb-10 border-b border-gray-100">
                                <div className="space-y-2">
                                    <h1 className="font-playfair text-5xl font-black text-midnight tracking-tighter">
                                        {selectedCategory === 'All' ? (searchTerm ? `Query: "${searchTerm}"` : 'Global Catalog') : selectedCategory}
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-gold/20">
                                            {filtered.length} Discoveries
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Curated Luxury Matrix</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400 group-hover:text-gold transition-colors z-10">Sort:</span>
                                        <select value={sort} onChange={e => setSort(e.target.value)}
                                            className="appearance-none bg-white border border-gray-200 rounded-2xl pl-14 pr-12 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-gold/5 focus:border-gold/30 hover:border-gold/20 transition-all cursor-pointer shadow-sm relative z-0">
                                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="font-bold bg-white">{o.label.toUpperCase()}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform group-hover:rotate-180" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product Grid */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200 animate-luxury-entry stagger-2">
                            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mx-auto mb-8 shadow-inner">
                                <Search size={48} strokeWidth={1} />
                            </div>
                            <h3 className="font-playfair text-4xl font-black text-midnight tracking-tighter mb-4">No Discoveries within current Parameters</h3>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-10">Refine your inquiry or adjust the search matrix</p>
                            <button onClick={() => { onCategorySelect && onCategorySelect('All'); }} className="bg-midnight text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gold hover:text-midnight hover:shadow-glow transition-all duration-500">Reset System Filter</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-12 pb-24 px-2 animate-luxury-entry stagger-4">
                            {/* Render Filtered Products */}
                            {filtered.map(product => (
                                <ProductCard key={product.id} product={product} onRent={handleRentClick} onAddToCart={handleQuickAdd} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
