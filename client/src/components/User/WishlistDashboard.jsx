import React from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import ProductCard from './ProductCard';
import Button from '../Shared/Button';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export default function WishlistDashboard({ onNavigate, onProductClick }) {
    // We'll mock wishlist data for now by taking a slice of products
    // In a real app, this would come from a WishlistContext or API
    const { allProducts } = useProducts();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const wishlistItems = allProducts.slice(0, 2); // Mock: first two items

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

    return (
        <div className="max-w-7xl mx-auto py-16 px-6 animate-luxury-entry">
            <div className="mb-16 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-midnight/5 backdrop-blur-xl text-gold rounded-full mb-2 border border-midnight/5 shadow-2xl">
                    <Heart size={32} fill="currentColor" />
                </div>
                <h1 className="font-playfair text-5xl font-black text-midnight tracking-tighter">Curated Desires</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Elite Selection for Upcoming Occasions</p>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm">
                    <h3 className="font-playfair text-2xl font-semibold text-gray-400 mb-4">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
                        Found something you love? Tap the heart icon on any product to save it here for later.
                    </p>
                    <Button onClick={() => onNavigate('catalog')} className="px-12 py-4 rounded-2xl text-lg font-bold">
                        Browse Collection <ArrowRight size={20} className="ml-2" />
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {wishlistItems.map(product => (
                        <div key={product.id} className="relative group">
                            <ProductCard
                                product={product}
                                onRent={() => onProductClick && onProductClick(product)}
                                onAddToCart={handleQuickAdd}
                            />
                            {/* Wishlist specific remove button */}
                            <button
                                className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-md transform scale-0 group-hover:scale-100 transition-all duration-300 hover:bg-red-500 hover:text-white"
                                title="Remove from wishlist"
                            >
                                <Heart size={16} fill="currentColor" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {wishlistItems.length > 0 && (
                <div className="mt-20 bg-midnight rounded-[3rem] p-12 text-white relative overflow-hidden group shadow-glow">
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="text-center lg:text-left">
                            <h2 className="font-playfair text-4xl font-black mb-3 tracking-tight">Step into the Radiance</h2>
                            <p className="text-[11px] font-black text-gold uppercase tracking-[0.3em]">Transition from Desire to Acquisition</p>
                        </div>
                        <button
                            onClick={() => onNavigate('cart')}
                            className="bg-gold text-midnight px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:shadow-glow transition-all duration-500 flex items-center gap-3 group/btn"
                        >
                            Review Manifest <ShoppingBag size={18} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>
            )}
        </div>
    );
}
