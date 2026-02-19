import React, { useState, useEffect } from 'react';
import { X, Star, Heart, Share2, ShieldCheck, Truck, RefreshCw, ChevronLeft, ChevronRight, ShoppingCart, MessageSquare, Send, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../Shared/Button';
import Loader from '../Shared/Loader';
import { formatCurrency, getStockStatus, getTodayString, DEFAULT_IMAGE } from '../../utils/helpers';

export default function ProductDetailsModal({ product: initialProduct, isOpen, onClose }) {
    const { addToCart } = useCart();
    const { getDetailedProduct, submitReview } = useProducts();
    const { currentUser } = useAuth();
    const toast = useToast();
    const today = getTodayString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [product, setProduct] = useState(initialProduct);
    const [loading, setLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [size, setSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(tomorrow);
    const [errors, setErrors] = useState({});

    // Review Form State
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Fetch Full Details on Open
    useEffect(() => {
        if (isOpen && initialProduct) {
            setLoading(true);
            getDetailedProduct(initialProduct.id)
                .then(setProduct)
                .finally(() => setLoading(false));

            // Reset local UI state
            setCurrentImageIndex(0);
            setSize('');
            setQuantity(1);
            setStartDate(today);
            setEndDate(tomorrow);
            setErrors({});
            setNewComment('');
            setNewRating(5);
        }
    }, [isOpen, initialProduct?.id]);

    if (!isOpen || !initialProduct) return null;

    const displayProduct = product || initialProduct;
    const images = displayProduct.images?.length > 0 ? displayProduct.images : [DEFAULT_IMAGE];
    const stock = getStockStatus(displayProduct.availableQuantity);
    const rentalDays = Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000));
    const rentalFee = displayProduct.pricePerDay * rentalDays * quantity;
    const deposit = displayProduct.securityDeposit * quantity;
    const total = rentalFee + deposit;

    // Discount Calculation
    const retailPrice = displayProduct.retailPrice || (displayProduct.pricePerDay * 5);
    const discount = Math.round(((retailPrice - displayProduct.pricePerDay) / retailPrice) * 100);

    const validate = () => {
        const errs = {};
        if (!size) errs.size = 'Please select a size';
        if (!startDate) errs.startDate = 'Required';
        if (!endDate) errs.endDate = 'Required';
        if (startDate && endDate && endDate <= startDate) errs.endDate = 'End date must be after start date';
        if (quantity < 1 || quantity > displayProduct.availableQuantity) errs.quantity = `Max available: ${displayProduct.availableQuantity}`;
        return errs;
    };

    const handleAddToCart = () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        addToCart(displayProduct, startDate, endDate, size, quantity);
        toast.success(`${displayProduct.name} added to cart!`);
        onClose();
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            toast.error('Please login to write a review');
            return;
        }
        if (!newComment.trim()) return;

        setSubmittingReview(true);
        try {
            await submitReview(displayProduct.id, { rating: newRating, comment: newComment });
            toast.success('Review submitted successfully!');
            setNewComment('');
            // Refresh product details to show new review
            const updated = await getDetailedProduct(displayProduct.id);
            setProduct(updated);
        } catch (err) {
            toast.error('Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-3xl w-full max-w-7xl h-full max-h-[96vh] overflow-hidden shadow-2xl flex flex-col animate-scale-in">
                {/* Header Actions */}
                <div className="absolute top-6 right-6 z-20 flex gap-3">
                    <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-all shadow-lg border border-gray-100">
                        <Heart size={20} />
                    </button>
                    <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white text-gray-500 hover:text-blue-500 transition-all shadow-lg border border-gray-100">
                        <Share2 size={20} />
                    </button>
                    <button onClick={onClose} className="p-3 bg-midnight text-white rounded-full hover:bg-red-600 transition-all shadow-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* Left: Image Gallery (LG: 7 cols) */}
                            <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
                                {/* Thumbnails Sidebar */}
                                <div className="hidden md:flex flex-col gap-3 order-1">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onMouseEnter={() => setCurrentImageIndex(idx)}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 shadow-sm ${idx === currentImageIndex ? 'border-midnight ring-2 ring-midnight/10' : 'border-gray-100 opacity-60 hover:opacity-100 hover:border-gray-300'}`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>

                                {/* Main Image */}
                                <div className="flex-1 relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner group order-2">
                                    <img
                                        src={images[currentImageIndex]}
                                        alt={displayProduct.name}
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                    {images.length > 1 && (
                                        <>
                                            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 text-midnight hover:bg-white shadow-xl opacity-0 group-hover:opacity-100 transition-all">
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 text-midnight hover:bg-white shadow-xl opacity-0 group-hover:opacity-100 transition-all">
                                                <ChevronRight size={24} />
                                            </button>
                                        </>
                                    )}
                                    <div className="absolute top-6 left-6">
                                        <div className="flex flex-col gap-2">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg ${stock.color === 'text-green-600' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                {stock.label}
                                            </span>
                                            {displayProduct.ratings >= 4 && (
                                                <span className="bg-gold text-midnight px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg w-fit">
                                                    <Star size={14} fill="currentColor" /> Bestseller
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Product Info (LG: 5 cols) */}
                            <div className="lg:col-span-5 flex flex-col">
                                <div className="mb-2">
                                    <p className="text-gold font-bold text-sm tracking-widest uppercase mb-1">Brand: {displayProduct.vendor?.shopName || 'Premium Collection'}</p>
                                    <h1 className="text-4xl font-playfair font-bold text-midnight leading-tight">{displayProduct.name}</h1>
                                </div>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-lg">
                                        <span className="text-green-700 font-bold">{displayProduct.ratings || '5.0'}</span>
                                        <Star size={14} fill="currentColor" className="text-gold" />
                                    </div>
                                    <span className="text-gray-400 text-sm border-l border-gray-200 pl-3">
                                        {displayProduct.reviewCount || 0} Dynamic Global Reviews
                                    </span>
                                </div>

                                <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 mb-8">
                                    <div className="flex items-center gap-3 text-red-500 font-bold text-sm uppercase tracking-tighter mb-2">
                                        <span className="flex items-center gap-1 bg-red-100 px-3 py-1 rounded-full"><TrendingUp size={14} /> Limited time deal</span>
                                    </div>
                                    <div className="flex items-baseline gap-4 mb-2">
                                        <span className="text-3xl text-red-500 font-extralight italic">-{discount}%</span>
                                        <div className="flex flex-col">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-bold text-midnight mt-1">₹</span>
                                                <span className="text-5xl font-bold text-midnight leading-none">{Math.floor(displayProduct.pricePerDay)}</span>
                                                <span className="text-xl font-bold text-midnight leading-none">00</span>
                                            </div>
                                            <p className="text-gray-400 text-xs mt-1">M.R.P: <span className="line-through">{formatCurrency(retailPrice)}</span></p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 italic mt-2">Inclusive of all taxes & dry cleaning charges</p>
                                </div>

                                {/* Custom Offers Selection */}
                                <div className="mb-8">
                                    <h3 className="flex items-center gap-2 font-bold text-midnight mb-4 uppercase tracking-tighter text-sm">
                                        <ShieldCheck size={18} className="text-gold" /> Offers & Benefits
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 border-2 border-dashed border-gray-200 rounded-2xl hover:border-gold transition-colors cursor-pointer group">
                                            <p className="font-bold text-xs text-midnight group-hover:text-gold transition-colors">Bank Offer</p>
                                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">Upto ₹1500 off on select bank cards</p>
                                        </div>
                                        <div className="p-3 border-2 border-dashed border-gray-200 rounded-2xl hover:border-gold transition-colors cursor-pointer group">
                                            <p className="font-bold text-xs text-midnight group-hover:text-gold transition-colors">Style Points</p>
                                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">Earn 50 bonus points on this rental</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Selection Form */}
                                <div className="space-y-6 mb-8">
                                    <div>
                                        <label className="block text-sm font-bold text-midnight mb-3">Select Size</label>
                                        <div className="flex flex-wrap gap-2">
                                            {displayProduct.sizes?.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setSize(s)}
                                                    className={`px-6 py-3 rounded-2xl font-bold border-2 transition-all ${size === s ? 'bg-midnight border-midnight text-white shadow-xl scale-105' : 'bg-white border-gray-100 text-gray-600 hover:border-gold hover:text-gold'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.size && <p className="text-red-500 text-xs mt-2 font-medium">{errors.size}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rental Starts</label>
                                            <input type="date" value={startDate} min={today} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-gold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rental Ends</label>
                                            <input type="date" value={endDate} min={startDate || today} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-gold" />
                                        </div>
                                    </div>
                                </div>

                                {/* Primary CTA */}
                                <div className="mt-auto space-y-4">
                                    {rentalDays > 0 && (
                                        <div className="flex items-center justify-between p-4 bg-midnight text-white rounded-3xl shadow-glow overflow-hidden relative group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative z-10 flex flex-col">
                                                <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Final Quote ({rentalDays} days)</span>
                                                <span className="text-2xl font-bold">{formatCurrency(total)}</span>
                                            </div>
                                            <Button onClick={handleAddToCart} className="bg-gold text-midnight hover:bg-white border-none px-8 py-3 rounded-2xl shadow-xl font-black uppercase text-sm">
                                                Confirm Rental
                                            </Button>
                                        </div>
                                    )}
                                    {rentalDays <= 0 && (
                                        <Button fullWidth onClick={handleAddToCart} size="lg" className="rounded-3xl py-6 font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                                            <ShoppingCart size={24} /> Add to Cart (Pick dates)
                                        </Button>
                                    )}

                                    {/* Seller Info */}
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gold shadow-sm">
                                            {displayProduct.vendor?.avatar ? <img src={displayProduct.vendor.avatar} className="w-full h-full rounded-full object-cover" /> : <User size={24} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ships & Sold by</p>
                                            <p className="text-sm font-black text-midnight">{displayProduct.vendor?.shopName || 'StyleSwap Official'}</p>
                                        </div>
                                        <button className="ml-auto text-gold text-xs font-bold hover:underline">Full Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews & Description Extension */}
                        <div className="mt-16 border-t border-gray-100 pt-16">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                                {/* Left Side: Description & Info */}
                                <div className="lg:col-span-4 space-y-10">
                                    <div>
                                        <h3 className="font-playfair text-2xl font-bold text-midnight mb-6">About this Item</h3>
                                        <div className="prose prose-sm text-gray-600 leading-relaxed max-w-none">
                                            {displayProduct.description.split('\n').map((para, i) => (
                                                <p key={i} className="mb-4">{para}</p>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-3xl text-center">
                                            <Truck className="text-blue-500 mb-2" size={24} />
                                            <span className="text-xs font-bold text-midnight">Free Delivery</span>
                                            <span className="text-[10px] text-gray-400">On all rentals</span>
                                        </div>
                                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-3xl text-center">
                                            <RefreshCw className="text-purple-500 mb-2" size={24} />
                                            <span className="text-xs font-bold text-midnight">Free Returns</span>
                                            <span className="text-[10px] text-gray-400">Pick-up at your door</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Reviews Section */}
                                <div className="lg:col-span-8">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="font-playfair text-2xl font-bold text-midnight">Customer Reviews</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-gold">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < Math.floor(displayProduct.ratings || 0) ? "currentColor" : "none"} className={i < Math.floor(displayProduct.ratings || 0) ? "" : "text-gray-200"} />)}
                                            </div>
                                            <span className="font-bold text-midnight">{displayProduct.ratings || '5.0'} out of 5</span>
                                        </div>
                                    </div>

                                    {/* Add Review Form */}
                                    {currentUser ? (
                                        <div className="bg-gray-50 rounded-3xl p-6 lg:p-8 mb-12 border border-gray-100">
                                            <h4 className="font-bold text-midnight mb-6 flex items-center gap-2">
                                                <MessageSquare size={18} className="text-gold" /> Write a Global Review
                                            </h4>
                                            <form onSubmit={handleReviewSubmit} className="space-y-6">
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Overall Rating</label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setNewRating(star)}
                                                                className={`p-2 transition-all ${newRating >= star ? 'text-gold scale-110' : 'text-gray-300 hover:text-gold/50'}`}
                                                            >
                                                                <Star size={32} fill={newRating >= star ? "currentColor" : "none"} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <textarea
                                                        value={newComment}
                                                        onChange={e => setNewComment(e.target.value)}
                                                        placeholder="Share your experience wearing this outfit globally..."
                                                        className="w-full bg-white border border-gray-100 rounded-3xl p-5 text-sm min-h-[120px] focus:ring-2 focus:ring-gold focus:border-gold transition-all shadow-sm"
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={submittingReview}
                                                    className="bg-midnight text-white px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-glow hover:-translate-y-0.5 transition-all flex items-center gap-3 disabled:opacity-50"
                                                >
                                                    {submittingReview ? 'Posting...' : <><Send size={18} /> Post Review</>}
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center mb-12">
                                            <User size={32} className="mx-auto text-gray-300 mb-4" />
                                            <p className="text-gray-500 font-medium italic">Please sign in to share your experience with the global community.</p>
                                        </div>
                                    )}

                                    {/* Review List */}
                                    <div className="space-y-8">
                                        {displayProduct.reviews && displayProduct.reviews.length > 0 ? (
                                            displayProduct.reviews.map((rev, idx) => (
                                                <div key={rev.id || idx} className="group animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                                    <div className="flex items-start gap-4 mb-3">
                                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-midnight font-bold border-2 border-white shadow-sm">
                                                            {rev.user?.avatar ? <img src={rev.user.avatar} className="w-full h-full rounded-full object-cover" /> : rev.user?.name[0] || 'U'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="font-bold text-midnight">{rev.user?.name || 'Anonymous User'}</p>
                                                                <span className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                            </div>
                                                            <div className="flex gap-0.5 text-gold mb-2">
                                                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-gray-200"} />)}
                                                            </div>
                                                            <p className="text-gray-600 text-sm leading-relaxed italic">"{rev.comment}"</p>
                                                        </div>
                                                    </div>
                                                    <div className="h-px bg-gray-50 ml-16" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10">
                                                <p className="text-gray-400 font-medium italic">No global reviews yet. Be the first to share your style!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper icon
function TrendingUp({ size }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 17 6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>;
}
