import React, { useState } from 'react';
import { Store, Star, Heart, RefreshCw } from 'lucide-react';
import Button from '../Shared/Button';
import { formatCurrency, getStockStatus, DEFAULT_IMAGE } from '../../utils/helpers';

export default function ProductCard({ product, onRent }) {
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
            className="group bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-gold/20 transition-all duration-500 flex flex-col relative cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onRent(product)}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                <img
                    src={images[currentImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    onError={e => { e.target.src = DEFAULT_IMAGE; }}
                />

                {/* Glassmorphism Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Badges - Glass Style */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {stock.label !== 'In Stock' && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter backdrop-blur-md ${stock.color.includes('red') ? 'bg-red-500/80 text-white' : 'bg-gold/80 text-midnight'} shadow-lg`}>
                            {stock.label}
                        </span>
                    )}
                    {product.ratings >= 4.5 && (
                        <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg border border-white/30">
                            <Star size={8} fill="currentColor" className="text-gold" /> Bestseller
                        </span>
                    )}
                </div>

                {/* Wishlist Button - Glass Style */}
                <button
                    onClick={(e) => { e.stopPropagation(); /* Prevents opening detail page */ }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white hover:bg-gold hover:text-midnight hover:border-gold transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                >
                    <Heart size={14} />
                </button>
            </div>

            {/* Quick Add Overlay is now redundant since whole card is clickable, but keeping simple visual or removing it */}

            {/* Content */}
            <div className="p-3 flex flex-col flex-1 bg-white relative">
                <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-1 text-[8px] text-gray-400 font-bold uppercase tracking-tight">
                        <Store size={8} className="text-gold" />
                        <span className="truncate max-w-[80px]">{product.vendor?.shopName || product.shopName || 'Premium Store'}</span>
                    </div>
                    {(product.ratings || 0) > 0 && (
                        <div className="flex items-center gap-0.5 bg-midnight text-white px-1 py-0.5 rounded text-[8px] font-black">
                            {product.ratings} <Star size={6} fill="currentColor" className="text-gold" />
                        </div>
                    )}
                </div>

                <h3 className="font-playfair font-bold text-midnight text-sm leading-tight mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-300">
                    {product.name}
                </h3>

                <div className="mt-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-base font-black text-midnight tracking-tighter">{formatCurrency(product.pricePerDay)}</span>
                                <span className="text-[8px] text-gray-400 font-bold uppercase">/ day</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-gray-300 line-through font-medium">{formatCurrency(retailPrice)}</span>
                                <span className="text-red-500 text-[8px] font-black tracking-tighter">{discount}%</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded-full">
                            <RefreshCw size={6} className="text-green-600" />
                            <span className="text-[6px] text-green-700 font-bold uppercase tracking-widest hidden md:block">Returns</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
