import React from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import ProductCard from './ProductCard';
import Button from '../Shared/Button';

export default function WishlistDashboard({ onNavigate, onProductClick }) {
    // We'll mock wishlist data for now by taking a slice of products
    // In a real app, this would come from a WishlistContext or API
    const { allProducts } = useProducts();
    const wishlistItems = allProducts.slice(0, 2); // Mock: first two items

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 animate-fade-in">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-500 rounded-full mb-4">
                    <Heart size={32} fill="currentColor" />
                </div>
                <h1 className="font-playfair text-4xl font-bold text-midnight">Your Wishlist</h1>
                <p className="text-gray-500 mt-2 max-w-lg mx-auto">Items you've saved for your upcoming special occasions.</p>
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
                <div className="mt-16 bg-midnight rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="font-playfair text-3xl font-bold mb-2">Ready to shine?</h2>
                            <p className="text-blue-100/70">Complete your rental and step out in style.</p>
                        </div>
                        <Button
                            onClick={() => onNavigate('cart')}
                            className="bg-gold text-midnight border-none hover:bg-white hover:text-midnight px-10 py-4 text-lg"
                        >
                            View Cart <ShoppingBag size={20} className="ml-2" />
                        </Button>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                </div>
            )}
        </div>
    );
}
