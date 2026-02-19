import React, { useState, useEffect } from 'react';
import { X, Star, Heart, Share2, ShieldCheck, Truck, RefreshCw, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Button from '../Shared/Button';
import { formatCurrency, getStockStatus, getTodayString, DEFAULT_IMAGE } from '../../utils/helpers';

export default function ProductDetailsModal({ product, isOpen, onClose }) {
    const { addToCart } = useCart();
    const toast = useToast();
    const today = getTodayString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [size, setSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(tomorrow);
    const [errors, setErrors] = useState({});

    // Reset state when product changes
    useEffect(() => {
        if (isOpen && product) {
            setCurrentImageIndex(0);
            setSize('');
            setQuantity(1);
            setStartDate(today);
            setEndDate(tomorrow);
            setErrors({});
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const images = product.images?.length > 0 ? product.images : [DEFAULT_IMAGE];
    const stock = getStockStatus(product.availableQuantity);
    const rentalDays = Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000));
    const rentalFee = product.pricePerDay * rentalDays * quantity;
    const deposit = product.securityDeposit * quantity;
    const total = rentalFee + deposit;

    const validate = () => {
        const errs = {};
        if (!size) errs.size = 'Please select a size';
        if (!startDate) errs.startDate = 'Required';
        if (!endDate) errs.endDate = 'Required';
        if (startDate && endDate && endDate <= startDate) errs.endDate = 'End date must be after start date';
        if (quantity < 1 || quantity > product.availableQuantity) errs.quantity = `Max available: ${product.availableQuantity}`;
        return errs;
    };

    const handleAddToCart = () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        addToCart(product, startDate, endDate, size, quantity);
        toast.success(`${product.name} added to cart!`);
        onClose();
    };

    const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Left Column: Images */}
                <div className="md:w-1/2 bg-gray-50 p-6 flex flex-col gap-4">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-sm group">
                        <img
                            src={images[currentImageIndex]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <span className={`badge ${stock.color} shadow-sm`}>{stock.label}</span>
                            {product.ratings >= 4.5 && <span className="badge bg-gold text-midnight shadow-sm flex items-center gap-1"><Star size={12} fill="currentColor" /> Bestseller</span>}
                        </div>
                        {/* Wishlist Button */}
                        <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-colors">
                            <Heart size={20} />
                        </button>
                    </div>
                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === currentImageIndex ? 'border-gold opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Details */}
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{product.category}</span>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                        <h2 className="text-3xl font-playfair font-bold text-midnight mb-2">{product.name}</h2>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex text-gold">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < Math.floor(product.ratings || 0) ? "currentColor" : "none"} className={i < Math.floor(product.ratings || 0) ? "" : "text-gray-300"} />
                                ))}
                            </div>
                            <span className="text-sm text-blue-600 hover:underline cursor-pointer">{product.reviews || 0} reviews</span>
                        </div>

                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-4xl font-bold text-midnight">{formatCurrency(product.pricePerDay)}</span>
                            <span className="text-lg text-gray-500">/ day</span>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
                    </div>

                    {/* Specifications */}
                    <div className="space-y-6 flex-1">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-midnight">Select Size</label>
                                <button className="text-xs text-blue-600 hover:underline">Size Guide</button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes?.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSize(s)}
                                        className={`w-12 h-12 rounded-lg font-medium border-2 transition-all flex items-center justify-center ${size === s
                                            ? 'border-midnight bg-midnight text-white shadow-md'
                                            : 'border-gray-200 text-gray-600 hover:border-gold hover:text-gold'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            {errors.size && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.size}</p>}
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <h4 className="font-semibold text-midnight mb-3">Rental Period</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        min={today}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold"
                                    />
                                    {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        min={startDate || today}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold"
                                    />
                                    {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Summary & Actions */}
                        <div className="border-t border-gray-100 pt-6">
                            {rentalDays > 0 && (
                                <div className="flex justify-between items-center mb-6 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-600">Total for {rentalDays} days</span>
                                        <span className="text-xs text-gray-400">Includes {formatCurrency(deposit)} deposit</span>
                                    </div>
                                    <span className="block font-bold text-2xl text-midnight">{formatCurrency(total)}</span>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className="w-[120px] flex-shrink-0">
                                    <div className="flex items-center justify-between border-2 border-gray-200 rounded-xl px-3 py-3 h-full">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-gray-400 hover:text-midnight font-bold px-2">-</button>
                                        <span className="font-bold text-midnight">{quantity}</span>
                                        <button onClick={() => setQuantity(q => Math.min(product.availableQuantity, q + 1))} className="text-gray-400 hover:text-midnight font-bold px-2">+</button>
                                    </div>
                                </div>
                                <Button
                                    fullWidth
                                    size="lg"
                                    onClick={handleAddToCart}
                                    disabled={product.availableQuantity === 0}
                                    className="shadow-glow text-lg py-3"
                                >
                                    <ShoppingCart className="mr-2" size={20} />
                                    {product.availableQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </Button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-2 pt-4">
                            <div className="flex flex-col items-center text-center gap-1 text-[10px] text-gray-500">
                                <ShieldCheck size={20} className="text-green-500" />
                                <span>Verified Authentic</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-1 text-[10px] text-gray-500">
                                <Truck size={20} className="text-blue-500" />
                                <span>Fast Delivery</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-1 text-[10px] text-gray-500">
                                <RefreshCw size={20} className="text-purple-500" />
                                <span>Free Returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
