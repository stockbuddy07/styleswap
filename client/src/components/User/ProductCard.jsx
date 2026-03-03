import React, { useState } from 'react';
import { Star, Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useProducts } from '../../context/ProductContext';
import Button from '../Shared/Button';
import { formatCurrency, getStockStatus, DEFAULT_IMAGE } from '../../utils/helpers';

export default function ProductCard({ product, onRent, onAddToCart }) {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { getDetailedProduct } = useProducts();
    const [isHovered, setIsHovered] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [isPrefetched, setIsPrefetched] = useState(false);
    const stock = getStockStatus(product.availableQuantity);
    const isWishlisted = isInWishlist(product.id);

    // Category-based color mapping for luxury tints
    const getCategoryStyles = (category) => {
        const cat = category?.toLowerCase() || '';
        if (cat.includes('wedding')) return { tint: 'bg-emerald-500/5', glow: 'shadow-emerald-500/10', text: 'text-emerald-500' };
        if (cat.includes('party')) return { tint: 'bg-indigo-500/5', glow: 'shadow-indigo-500/10', text: 'text-indigo-500' };
        if (cat.includes('jewelry')) return { tint: 'bg-rose-500/5', glow: 'shadow-rose-500/10', text: 'text-rose-500' };
        if (cat.includes('accessories')) return { tint: 'bg-amber-500/5', glow: 'shadow-amber-500/10', text: 'text-amber-600' };
        if (cat.includes('shoes')) return { tint: 'bg-orange-500/5', glow: 'shadow-orange-500/10', text: 'text-orange-500' };
        return { tint: 'bg-gray-500/5', glow: 'shadow-gray-500/10', text: 'text-gold' };
    };

    const catStyles = getCategoryStyles(product.category);

    // Ultra-robust image handling
    const getImages = (raw) => {
        if (!raw) return [DEFAULT_IMAGE];
        let arr = [];
        try {
            arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch (e) {
            arr = typeof raw === 'string' ? raw.split(',').map(s => s.trim()) : [raw];
        }
        if (!Array.isArray(arr)) arr = [arr];
        const valid = arr.filter(img => typeof img === 'string' && img.trim() !== '');
        return valid.length > 0 ? valid : [DEFAULT_IMAGE];
    };

    const images = getImages(product.images);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (!isPrefetched && getDetailedProduct) {
            getDetailedProduct(product.id).catch(() => { });
            setIsPrefetched(true);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setCurrentImage(0);
    };

    React.useEffect(() => {
        let interval;
        if (isHovered && images.length > 1) {
            interval = setInterval(() => {
                setCurrentImage(prev => (prev + 1) % images.length);
            }, 1200);
        }
        return () => clearInterval(interval);
    }, [isHovered, images.length]);

    const retailPrice = product.retailPrice || (product.pricePerDay * 15);
    const discount = Math.round(((retailPrice - product.pricePerDay) / retailPrice) * 100);

    return (
        <div
            className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden flex flex-col relative cursor-pointer active:scale-[0.98] shadow-sm"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onRent(product)}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                <img
                    src={images[currentImage]}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = DEFAULT_IMAGE; }}
                />

                {/* AD Badge */}
                <div className="absolute top-4 left-4 px-2 py-0.5 bg-black/40 backdrop-blur-md text-white text-[9px] font-black rounded shadow-sm opacity-80 uppercase tracking-widest z-10">
                    AD
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl z-10 border border-white/20">
                    <span className="text-[11px] font-black text-midnight">{(product.ratings || 0).toFixed(1)}</span>
                    <Star size={11} fill="currentColor" className="text-emerald-500" />
                    <div className="w-px h-3 bg-gray-200 mx-1" />
                    <span className="text-[10px] font-bold text-gray-400">{product.reviews?.length || 0}</span>
                </div>



                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                    }}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full shadow-2xl flex items-center justify-center border z-10 transition-colors duration-200 ${isWishlisted
                        ? 'bg-midnight text-gold border-gold/50'
                        : 'bg-white/80 backdrop-blur-md text-gray-400 border-white/20'
                        }`}
                >
                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-1 bg-white">
                {/* Brand Name */}
                <div className="flex items-center justify-between mb-1.5 text-[11px] font-black uppercase tracking-[0.2em]">
                    <p className="text-gray-400 truncate max-w-[full]">
                        {product.designer?.brandName || product.shopName || 'StyleSwap Elite'}
                    </p>
                </div>

                {/* Product Name */}
                <h4 className="font-playfair font-black text-midnight text-[17px] leading-tight truncate mb-3">
                    {product.name}
                </h4>

                {/* Price & Discount Row */}
                <div className="mt-auto pt-3 border-t border-gray-50">
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                            {discount > 0 && (
                                <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest mb-0.5">
                                    SAVE {discount}%
                                </span>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-gray-300 line-through text-[12px]">
                                    ₹{Math.round(retailPrice)}
                                </span>
                                <span className="text-midnight font-black text-[18px] leading-none">
                                    {formatCurrency(product.pricePerDay || product.price)}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
