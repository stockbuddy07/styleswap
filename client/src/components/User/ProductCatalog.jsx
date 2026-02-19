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



export default function ProductCatalog({ searchTerm = '', onRequireAuth }) {
    const { allProducts, loading } = useProducts();
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('name_asc');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Helper to handle rent click
    const handleRentClick = (product) => {
        if (!localStorage.getItem('styleswap_token')) {
            if (onRequireAuth) onRequireAuth();
            return;
        }
        setSelectedProduct(product);
    };

    const isHomeView = !searchTerm && category === 'All';

    const filtered = useMemo(() => {
        let list = allProducts.filter(p => {
            const q = searchTerm.toLowerCase();
            const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.shopName.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
            const matchCat = category === 'All' || (p.category && p.category.toLowerCase().includes(category.toLowerCase())) || (category === 'Wedding Season' && p.category.includes('Wedding'));
            // Allow loose matching for category rail demo
            return matchSearch && matchCat;
        });

        switch (sort) {
            case 'price_asc': list = [...list].sort((a, b) => a.pricePerDay - b.pricePerDay); break;
            case 'price_desc': list = [...list].sort((a, b) => b.pricePerDay - a.pricePerDay); break;
            case 'rating_desc': list = [...list].sort((a, b) => (b.ratings || 0) - (a.ratings || 0)); break;
            default: list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        }
        return list;
    }, [allProducts, searchTerm, category, sort]);

    return (
        <div className="space-y-8 animate-fade-in-up">
            {loading && <Loader fullPage={false} message="Curating collection..." />}
            {!loading && (
                <>
                    {/* Hero Section (Only on Home View) */}
                    {isHomeView && (
                        <div className="space-y-8">
                            <HeroCarousel />
                            <CategoryRail onSelect={setCategory} />

                            {/* Deal of the Day Banner */}
                            <div className="bg-gradient-to-r from-midnight to-blue-900 rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden shadow-soft group cursor-pointer">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Deal of the Day</span>
                                            <span className="flex items-center gap-1 text-gold text-sm font-medium"><Zap size={14} fill="currentColor" /> Ends in 02:45:12</span>
                                        </div>
                                        <h2 className="text-3xl font-playfair font-bold mb-2">Luxury Bridal Lehengas</h2>
                                        <p className="text-blue-100 max-w-md">Flat 30% OFF on rental charges for all Sabyasachi & Manish Malhotra collections. Limited time offer.</p>
                                    </div>
                                    <button onClick={() => setCategory('Wedding Attire')} className="bg-white text-midnight font-bold px-8 py-3 rounded-xl hover:bg-gold transition-colors shadow-lg">
                                        View Collection
                                    </button>
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute bottom-[-20px] right-[10%] opacity-20 transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                    <Store size={120} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-playfair font-bold text-midnight">Trending Now</h2>
                                <button onClick={() => setSort('rating_desc')} className="text-gold font-medium hover:underline flex items-center gap-1">
                                    See All <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Search/Filter Results Header */}
                    {!isHomeView && (
                        <div className="flex flex-col gap-4">
                            <button onClick={() => setCategory('All')} className="self-start text-sm text-gray-500 hover:text-midnight flex items-center gap-1">
                                ← Back to Home
                            </button>
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h1 className="font-playfair text-3xl font-bold text-midnight">
                                        {category === 'All' ? (searchTerm ? `Search: "${searchTerm}"` : 'All Products') : category}
                                    </h1>
                                    <p className="text-gray-500 text-sm mt-1">{filtered.length} items found</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <select value={sort} onChange={e => setSort(e.target.value)}
                                            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold hover:border-gray-300 shadow-sm cursor-pointer">
                                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product Grid */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Search size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="font-playfair text-xl font-semibold text-gray-500">No products found</h3>
                            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                            <button onClick={() => { setCategory('All'); }} className="mt-4 text-gold font-medium hover:underline">Clear Filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                            {/* Render Filtered Products */}
                            {filtered.map(product => (
                                <ProductCard key={product.id} product={product} onRent={handleRentClick} />
                            ))}
                        </div>
                    )}

                    <ProductDetailsModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
                </>
            )}
        </div>
    );
}
