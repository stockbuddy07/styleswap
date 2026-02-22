import React, { useState } from 'react';
import { Store, Star, Heart, RefreshCw, ShoppingBag, CheckCircle } from 'lucide-react';
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
            className="group bg-white rounded-3xl border border-gray-100 overflow-hidden md:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col relative cursor-pointer active:scale-[0.98]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onRent(product)}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                <img
                    src={images[currentImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105"
                    onError={e => { e.target.src = DEFAULT_IMAGE; }}
                />

                {/* AD Badge */}
                <div className="absolute top-3 left-3 px-1.5 py-0.5 bg-black/40 backdrop-blur-md text-white text-[8px] font-bold rounded shadow-sm opacity-80 uppercase tracking-tighter">
                    AD
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg shadow-sm">
                    <span className="text-[10px] font-black text-midnight">{(product.ratings || 0).toFixed(1)}</span>
                    <Star size={10} fill="currentColor" className="text-emerald-500" />
                    <div className="w-px h-2 bg-gray-300 mx-0.5" />
                    <span className="text-[9px] font-medium text-gray-500">{product.reviews?.length || 0}</span>
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-red-500 transition-all duration-300 border border-gray-100"
                >
                    <Heart size={16} className="transition-all" />
                </button>
            </div>

            {/* Content Area */}
            <div className="p-3.5 sm:p-4 flex flex-col flex-1 bg-white">
                {/* Brand Name */}
                <h4 className="font-bold text-midnight text-[14px] sm:text-[15px] leading-tight truncate">
                    {product.designer?.brandName || product.shopName || 'StyleSwap Elite'}
                </h4>

                {/* Product Name (Subdued) */}
                <p className="text-[11px] sm:text-[12px] text-gray-400 font-medium truncate mb-2">
                    {product.name}
                </p>

                {/* Price & Discount Row */}
                <div className="mt-auto space-y-1.5">
                    <div className="flex items-center gap-2">
                        {discount > 0 && (
                            <span className="text-emerald-500 font-bold text-[12px] sm:text-[13px]">
                                ↓{discount}%
                            </span>
                        )}
                        <span className="text-gray-300 line-through text-[12px] sm:text-[13px]">
                            ₹{Math.round(retailPrice)}
                        </span>
                        <span className="text-midnight font-bold ml-auto text-[14px] sm:text-[15px]">
                            {formatCurrency(product.pricePerDay || product.price)}
                        </span>
                    </div>

                    {/* Bank Offer Banner */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50/50 rounded-lg border border-blue-100/50">
                        <div className="flex items-center justify-center p-0.5 bg-blue-600 rounded">
                            <CheckCircle size={8} className="text-white" />
                        </div>
                        <span className="text-[9px] font-bold text-blue-700 uppercase tracking-tighter">₹290 with Bank Offer</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
