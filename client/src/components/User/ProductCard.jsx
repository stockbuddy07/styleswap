import React, { useState } from 'react';
import { Store, Star, Heart, RefreshCw } from 'lucide-react';
import Button from '../Shared/Button';
import { formatCurrency, getStockStatus, DEFAULT_IMAGE } from '../../utils/helpers';

export default function ProductCard({ product, onRent }) {
    const [isHovered, setIsHovered] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const stock = getStockStatus(product.availableQuantity);

    const images = product.images && product.images.length > 0 ? product.images : [DEFAULT_IMAGE];

    const handleMouseEnter = () => {
        setIsHovered(true);
        // Preload other images if needed, or simple cycle logic
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
            }, 1000); // Change image every second
        }
        return () => clearInterval(interval);
    }, [isHovered, images.length]);

    const discount = Math.floor(Math.random() * 20) + 10; // Fake savings for demo
    const retailPrice = product.pricePerDay * 15; // Fake retail price

    return (
        <div
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-soft hover:border-gold/30 transition-all duration-300 flex flex-col relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                    src={images[currentImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={e => { e.target.src = DEFAULT_IMAGE; }}
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {stock.label !== 'In Stock' && <span className={`badge ${stock.color} shadow-sm`}>{stock.label}</span>}
                    {product.ratings >= 4.5 && <span className="badge bg-gold text-midnight shadow-sm flex items-center gap-1"><Star size={10} fill="currentColor" /> Bestseller</span>}
                </div>

                {/* Wishlist Button */}
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-colors shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 delay-75">
                    <Heart size={16} />
                </button>
            </div>

            {/* Quick Add Overlay (Mobile style on desktop hover) */}
            <div className="absolute bottom-36 left-0 right-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 hidden md:block">
                <Button fullWidth size="sm" onClick={() => onRent(product)} className="shadow-lg">
                    Rent Now
                </Button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Store size={12} className="text-gold" />
                        <span className="truncate max-w-[120px]">{product.shopName}</span>
                    </div>
                    {product.ratings > 0 && (
                        <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded text-xs font-bold text-green-700">
                            {product.ratings} <Star size={10} fill="currentColor" />
                        </div>
                    )}
                </div>

                <h3 className="font-semibold text-midnight text-sm leading-tight mb-1 line-clamp-2 group-hover:text-gold transition-colors">
                    {product.name}
                </h3>

                <div className="mt-auto pt-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-midnight">{formatCurrency(product.pricePerDay)}</span>
                        <span className="text-xs text-gray-500 font-medium">/ day</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className="text-gray-400 line-through">{formatCurrency(retailPrice)}</span>
                        <span className="text-red-500 font-bold">{discount}% OFF</span>
                    </div>

                    {/* Free Delivery Tag */}
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-green-600 font-medium uppercase tracking-wide">
                        <RefreshCw size={10} /> Free Returns
                    </div>
                </div>
            </div>
        </div>
    );
}
