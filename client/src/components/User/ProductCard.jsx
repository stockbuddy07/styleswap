import React, { useState } from 'react';
import { Store, Star, Heart, RefreshCw, ShoppingBag } from 'lucide-react';
import Button from '../Shared/Button';
import { formatCurrency, getStockStatus, DEFAULT_IMAGE } from '../../utils/helpers';

export default function ProductCard({ product, onRent, onAddToCart }) {
    const [isHovered, setIsHovered] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const stock = getStockStatus(product.availableQuantity);

    // Ultra-robust image handling: handles raw strings, JSON strings, and arrays
    const getImages = (raw) => {
        if (!raw) return [DEFAULT_IMAGE];
        let arr = [];
        try {
            arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch (e) {
            // Handle cases where it's a raw comma-separated string or just one URL
            arr = typeof raw === 'string' ? raw.split(',').map(s => s.trim()) : [raw];
        }

        if (!Array.isArray(arr)) arr = [arr];
        const valid = arr.filter(img => typeof img === 'string' && img.trim() !== '');
        return valid.length > 0 ? valid : [DEFAULT_IMAGE];
    };

    const images = getImages(product.images);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setCurrentImage(0);
    };

    // Cycle images on hover
    React.useEffect(() => {
        let interval;
        if (isHovered && images.length > 1) {
            interval = setInterval(() => {
                setCurrentImage(prev => (prev + 1) % images.length);
            }, 1200); // Slightly slower for elegance
        }
        return () => clearInterval(interval);
    }, [isHovered, images.length]);

    const retailPrice = product.retailPrice || (product.pricePerDay * 15);
    const discount = Math.round(((retailPrice - product.pricePerDay) / retailPrice) * 100);

    return (
        <div
            className="group bg-white rounded-[2.5rem] border border-gray-100/50 overflow-hidden md:hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] md:hover:border-gold/30 transition-all duration-700 flex flex-col relative cursor-pointer active:scale-95 md:active:scale-100"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onRent(product)}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                    src={images[currentImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out md:group-hover:scale-110"
                    onError={e => { e.target.src = DEFAULT_IMAGE; }}
                />

                {/* Luxury Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/20 to-transparent opacity-0 md:group-hover:opacity-100 transition-all duration-700" />

                {/* Badges - Premium Soft Style */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {stock.label !== 'In Stock' && (
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gold/90 text-midnight backdrop-blur-md shadow-lg">
                            {stock.label}
                        </span>
                    )}
                </div>

                {/* Wishlist Button - Minimalist */}
                <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-midnight transition-all duration-500 shadow-xl opacity-0 md:group-hover:opacity-100"
                >
                    <Heart size={18} className="transition-all" />
                </button>

                {/* Quick Add Button - Premium Slide Up */}
                <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart && onAddToCart(product);
                        }}
                        className="w-full py-3 bg-white/95 backdrop-blur-md text-midnight text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-midnight hover:text-white transition-all flex items-center justify-center gap-2 border border-white/20"
                    >
                        <ShoppingBag size={12} />
                        Add to Bag
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex flex-col flex-1 bg-white relative">
                {/* Brand & Rating Row */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
                        <Store size={10} className="text-gray-400" />
                        <span className="truncate max-w-[120px]">{product.designer?.brandName || product.shopName || 'StyleSwap Collection'}</span>
                    </div>
                </div>

                {/* Product Name */}
                <h3 className="font-serif font-medium text-midnight text-[1.25rem] leading-tight mb-4 line-clamp-2">
                    {product.name}
                </h3>

                {/* Price & Badges Row */}
                <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-midnight tracking-tighter">
                            {formatCurrency(product.pricePerDay || product.price)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] relative -top-1">/ Epoch</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-gray-300 line-through font-medium">
                            {formatCurrency(retailPrice)}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-500 text-[10px] font-bold tracking-tight">
                            {discount}% Yield
                        </span>
                        <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100 ml-auto">
                            <RefreshCw size={10} className="text-green-600" />
                            <span className="text-[9px] text-green-700 font-black uppercase tracking-widest">Eco-Return</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
