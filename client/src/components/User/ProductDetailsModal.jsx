import React, { useState, useEffect } from 'react';
import { Star, Heart, Share2, Truck, RefreshCw, ChevronLeft, ChevronRight, ShoppingCart, MessageSquare, Send, User, Search, ArrowDown, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import Button from '../Shared/Button';
import Loader from '../Shared/Loader';
import { formatCurrency, getStockStatus, getTodayString, DEFAULT_IMAGE } from '../../utils/helpers';

export default function ProductDetailsModal({ product: initialProduct, isOpen, onClose, onNavigate }) {
    const { addToCart, cartCount } = useCart();
    const { getDetailedProduct, submitReview } = useProducts();
    const { currentUser } = useAuth();
    const { toggleWishlist, isInWishlist } = useWishlist();
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
        if (!currentUser) {
            toast.info('Please sign in to modify manifest');
            onNavigate && onNavigate('login');
            onClose();
            return;
        }
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        addToCart(displayProduct, startDate, endDate, size, quantity);
        toast.success(`Asset locked in manifest!`);
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

            <div className="relative bg-white w-full max-w-7xl h-full md:h-[96vh] md:max-h-[96vh] md:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex flex-col h-full w-full animate-scale-in">
                    {/* Marketplace Sticky Header */}
                    <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-4 shrink-0">
                        <button onClick={onClose} className="p-1 -ml-1 text-midnight hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </button>

                        <div className="flex-1 relative">
                            <div className="flex items-center gap-2 bg-blue-50/50 border border-blue-200/50 px-3 py-1.5 rounded-lg w-full">
                                <Search size={16} className="text-gray-400" />
                                <span className="text-[13px] text-gray-500 font-medium">Search for products</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative p-2 text-midnight hover:bg-gray-100 rounded-full transition-colors">
                                <ShoppingCart size={22} />
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">2</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
                        <div className="lg:p-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-10">

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
                                    <div className="flex-1 relative aspect-[4/5] md:rounded-3xl overflow-hidden bg-gray-50 border-b lg:border border-gray-100 shadow-inner group lg:order-2">
                                        <img
                                            src={images[currentImageIndex]}
                                            alt={displayProduct.name}
                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                        />

                                        {/* Vertical Floating Actions (Top-Right) */}
                                        <div className="absolute top-4 right-4 flex flex-col gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleWishlist(displayProduct);
                                                }}
                                                className={`p-2.5 rounded-full shadow-lg border transition-all active:scale-90 ${isInWishlist(displayProduct.id)
                                                        ? 'bg-midnight text-gold border-gold/50 shadow-glow'
                                                        : 'bg-white/95 border-gray-100 text-midnight hover:text-red-500'
                                                    }`}
                                            >
                                                <Heart size={22} fill={isInWishlist(displayProduct.id) ? "currentColor" : "none"} strokeWidth={1.5} />
                                            </button>
                                            <button className="p-2.5 bg-white/95 rounded-full shadow-lg border border-gray-100 text-midnight hover:text-blue-500 transition-all active:scale-90">
                                                <Share2 size={20} strokeWidth={1.5} />
                                            </button>
                                        </div>

                                        {/* Rating Badge Overlay (Bottom-Left) */}
                                        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-black/5">
                                            <div className="flex items-center gap-1 pr-1.5 border-r border-gray-300">
                                                <span className="text-[13px] font-black text-midnight">{(displayProduct.ratings || 0).toFixed(1)}</span>
                                                <Star size={12} fill="currentColor" className="text-emerald-500" />
                                            </div>
                                            <span className="text-[12px] font-medium text-gray-500">{displayProduct.reviews?.length || 0}</span>
                                        </div>

                                        {images.length > 1 && (
                                            <>
                                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 text-midnight hover:bg-white shadow-xl opacity-0 lg:group-hover:opacity-100 transition-all hidden lg:block">
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 text-midnight hover:bg-white shadow-xl opacity-0 lg:group-hover:opacity-100 transition-all hidden lg:block">
                                                    <ChevronRight size={24} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Product Info (LG: 5 cols) */}
                                <div className="lg:col-span-5 flex flex-col pt-10">
                                    {/* Size Selector (Top) */}
                                    <div className="space-y-6 mb-10">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <label className="text-[17px] font-bold text-midnight">Select Size</label>
                                                <button className="text-[14px] font-bold text-blue-600 hover:underline">Size Chart</button>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {['M', 'L', 'XL', 'XXL', '3XL'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setSize(s)}
                                                        className={`min-w-[56px] h-14 flex items-center justify-center rounded-xl font-bold text-[15px] border transition-all ${size === s ? 'border-midnight bg-white ring-1 ring-midnight shadow-sm' : 'border-gray-200 text-gray-500 hover:border-midnight'}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.size && <p className="text-red-500 text-xs mt-2 font-medium">{errors.size}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Brand & Price (Now below Size) */}
                                        <div className="pt-8 border-t border-gray-100">
                                            <h1 className="text-[18px] font-bold text-midnight leading-tight mb-1">{displayProduct.vendor?.shopName || 'Marketplace Collection'}</h1>
                                            <p className="text-[15px] text-gray-500 font-medium mb-6">{displayProduct.name}</p>

                                            <div className="flex items-center gap-3">
                                                <span className="text-emerald-600 flex items-center gap-0.5 font-bold text-2xl">
                                                    <ArrowDown size={20} strokeWidth={3} />
                                                    {discount}%
                                                </span>
                                                <span className="text-gray-400 text-xl line-through">999</span>
                                                <span className="text-3xl font-black text-midnight">₹{displayProduct.pricePerDay}</span>
                                            </div>
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

                                    {/* Seller Info */}
                                    <div className="mt-8 flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
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
                        <div className="mt-16 border-t border-gray-100 pt-16 px-4 lg:px-10">
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
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={18} fill={i < Math.floor(displayProduct.ratings || 0) ? "currentColor" : "none"} className={i < Math.floor(displayProduct.ratings || 0) ? "" : "text-gray-200"} />
                                                ))}
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
                                                            {rev.user?.avatar ? <img src={rev.user.avatar} className="w-full h-full rounded-full object-cover" /> : rev.user?.name?.[0] || 'U'}
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

                {/* Fixed Twin-Button Bar */}
                <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex items-center gap-4 z-[60] shrink-0">
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 h-14 bg-white border border-gray-200 text-midnight rounded-2xl font-bold text-[15px] hover:bg-gray-50 hover:border-midnight/30 hover:shadow-sm active:scale-[0.98] transition-all"
                    >
                        Add to cart
                    </button>

                    <button
                        onClick={handleAddToCart}
                        className="flex-1 h-14 bg-[#FFC107] text-midnight rounded-2xl font-black text-[15px] hover:bg-[#FFB300] hover:shadow-gold/20 hover:shadow-lg active:scale-[0.98] transition-all shadow-md"
                    >
                        {rentalDays > 0 ? `Buy at ${formatCurrency(total)}` : `Buy at ${formatCurrency(displayProduct.pricePerDay)}`}
                    </button>

                    <button
                        onClick={() => {
                            if (onNavigate) {
                                onNavigate('cart');
                                onClose();
                            }
                        }}
                        className="w-14 h-14 flex items-center justify-center border border-gray-100 rounded-2xl text-midnight hover:bg-gray-50 active:scale-95 transition-all relative group"
                    >
                        <ShoppingBag size={24} className="group-hover:rotate-12 transition-transform" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-midnight text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
