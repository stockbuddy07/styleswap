import React, { useState, useEffect, useMemo } from 'react';
import {
    ChevronLeft, ChevronRight, Star, Heart, Share2,
    ShieldCheck, Truck, RefreshCw, ShoppingCart,
    MessageSquare, Send, User, TrendingUp, ArrowLeft,
    CheckCircle2, Clock, Info, ShieldAlert, Sparkles
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../Shared/Loader';
import { formatCurrency, getTodayString, DEFAULT_IMAGE } from '../../utils/helpers';

export default function ProductDetailsPage({ productId, onBack }) {
    const { addToCart } = useCart();
    const { getDetailedProduct, submitReview, allProducts } = useProducts();
    const { currentUser } = useAuth();
    const toast = useToast();
    const today = getTodayString();

    // Default 3-day rental
    const defaultEnd = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [size, setSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [errors, setErrors] = useState({});
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Review Form State
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        if (productId) {
            setLoading(true);
            window.scrollTo(0, 0);
            getDetailedProduct(productId)
                .then(setProduct)
                .catch(err => {
                    toast.error('Failed to load product details');
                    onBack();
                })
                .finally(() => setLoading(false));
        }
    }, [productId]);

    const stats = useMemo(() => {
        if (!product) return null;
        const rentalDays = Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000));
        const rentalFee = product.pricePerDay * rentalDays * quantity;
        const deposit = product.securityDeposit * quantity;
        const total = rentalFee + deposit;

        // Accurate Discount Calculation
        const retailPrice = product.retailPrice || (product.pricePerDay * 50);
        const discountVal = ((retailPrice - product.pricePerDay) / retailPrice) * 100;
        const discount = discountVal > 99 ? discountVal.toFixed(1) : Math.round(discountVal);

        return { rentalDays, rentalFee, deposit, total, retailPrice, discount };
    }, [product, startDate, endDate, quantity]);

    // Similar Products Logic
    const similarProducts = useMemo(() => {
        if (!product || !allProducts) return [];
        return allProducts
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4);
    }, [product, allProducts]);

    if (loading) return <Loader fullPage message="Loading details..." />;
    if (!product) return null;

    const images = product.images?.length > 0 ? product.images : [DEFAULT_IMAGE];

    const handleAddToCart = () => {
        const errs = {};
        if (!size) errs.size = 'Selection required';
        if (new Date(endDate) <= new Date(startDate)) errs.date = 'Invalid range';

        if (Object.keys(errs).length) {
            setErrors(errs);
            toast.error('Please complete your selection');
            return;
        }

        addToCart(product, startDate, endDate, size, quantity);
        toast.success('Added to your collection!');
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) { toast.info('Please login to review'); return; }
        if (!newComment.trim()) return;

        setSubmittingReview(true);
        try {
            await submitReview(product.id, { rating: newRating, comment: newComment });
            toast.success('Your feedback has been published');
            setNewComment('');
            const updated = await getDetailedProduct(product.id);
            setProduct(updated);
        } catch (err) {
            toast.error('Failed to publish review');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="bg-gray-50/30 min-h-screen pb-20">
            {/* Top Navigation - Compact & Clean */}
            <nav className="sticky top-0 z-[40] bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 text-gray-600 hover:text-midnight transition-colors"
                    >
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-semibold tracking-wide">Back</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className={`p-2 rounded-full transition-all ${isWishlisted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100 hover:text-midnight'}`}
                        >
                            <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                        <button className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-midnight transition-all">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Visual Showcase - Left Thumbnails + Zoom Image */}
                    <div className="lg:col-span-7 flex gap-6 sticky top-32 h-fit">
                        {/* Thumbnails Column */}
                        <div className="flex flex-col gap-4 w-20 flex-shrink-0 h-[600px] overflow-y-auto scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onMouseEnter={() => setCurrentImageIndex(idx)}
                                    className={`w-full aspect-[3/4] rounded-lg overflow-hidden border transition-all flex-shrink-0 ${idx === currentImageIndex ? 'border-midnight ring-1 ring-midnight shadow-md' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>

                        {/* Main Image with Zoom */}
                        <div
                            className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm group z-10 cursor-crosshair"
                            onMouseMove={(e) => {
                                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                                const x = ((e.clientX - left) / width) * 100;
                                const y = ((e.clientY - top) / height) * 100;
                                e.currentTarget.style.setProperty('--x', `${x}%`);
                                e.currentTarget.style.setProperty('--y', `${y}%`);
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.setProperty('--x', '50%');
                                e.currentTarget.style.setProperty('--y', '50%');
                            }}
                        >
                            <img
                                src={images[currentImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-100 ease-out group-hover:scale-[2.5]"
                                style={{ transformOrigin: 'var(--x) var(--y)' }}
                            />

                            {/* Overlay Navigation Dots (Mobile Only) */}
                            <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-midnight' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Info - Compact & Professional */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Header Info */}
                        <div className="space-y-3 border-b border-gray-100 pb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                                        {product.category}
                                    </span>
                                    <h1 className="text-3xl font-playfair font-bold text-midnight leading-tight">
                                        {product.name}
                                    </h1>
                                </div>
                                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Star size={12} fill="currentColor" /> {product.ratings || '5.0'}
                                </div>
                            </div>

                            <div className="flex items-baseline gap-4">
                                <span className="text-4xl font-bold text-midnight">
                                    {formatCurrency(product.pricePerDay)}
                                    <span className="text-lg text-gray-400 font-normal ml-1">/day</span>
                                </span>
                                <div className="text-sm text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">
                                    {stats.discount}% OFF Retail
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">
                                Retail Value: {formatCurrency(stats.retailPrice)} • <span className="text-green-600 font-medium">In Stock</span>
                            </p>
                        </div>

                        {/* Selectors grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                            {/* Size */}
                            <div className="col-span-2">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-gray-900 uppercase">Size</label>
                                    <button className="text-[10px] text-gray-500 underline hover:text-midnight">Size Guide</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes?.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s)}
                                            className={`min-w-[3rem] px-4 py-2 rounded-lg text-sm font-medium border transition-all ${size === s ? 'bg-midnight border-midnight text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                                {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size}</p>}
                            </div>

                            {/* Dates */}
                            <div>
                                <label className="text-xs font-bold text-gray-900 uppercase mb-2 block">From</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    min={today}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-midnight focus:border-midnight outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-900 uppercase mb-2 block">To</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    min={startDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-midnight focus:border-midnight outline-none"
                                />
                            </div>
                        </div>

                        {/* Price Breakdown Box */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Rental Duration</span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg">{stats.rentalDays} Days</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Rental Fee ({stats.rentalDays}d)</span>
                                <span className="font-medium text-gray-900">{formatCurrency(stats.rentalFee)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span className="flex items-center gap-1 cursor-help" title="Refundable upon return">
                                    Security Deposit <Info size={12} />
                                </span>
                                <span className="font-medium text-gray-900">{formatCurrency(stats.deposit)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 flex justify-between items-center mt-2">
                                <span className="font-bold text-midnight">Total to Pay</span>
                                <span className="font-bold text-xl text-midnight">{formatCurrency(stats.total)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-midnight text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={18} /> Reserve Now
                            </button>
                            <button className="px-4 py-4 rounded-xl border border-gray-200 hover:border-gray-900 transition-colors">
                                <MessageSquare size={20} className="text-gray-600" />
                            </button>
                        </div>

                        <div className="flex justify-center gap-6 text-xs font-medium text-gray-500 mt-6">
                            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-600" /> Authenticity Guaranteed</span>
                            <span className="flex items-center gap-1"><Truck size={14} className="text-blue-600" /> Insured Shipping</span>
                            <span className="flex items-center gap-1"><RefreshCw size={14} className="text-orange-600" /> Professional Cleaning</span>
                        </div>
                    </div>
                </div>

                {/* Reviews Section (Moved Above Similar Creations) */}
                <div className="mt-20 border-t border-gray-200 pt-16">
                    <h3 className="text-2xl font-playfair font-bold text-midnight mb-8">Client Reviews ({product.reviews?.length || 0})</h3>
                    {/* Add Review */}
                    {currentUser && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-10">
                            <h4 className="font-bold text-sm mb-4">Write a Review</h4>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} type="button" onClick={() => setNewRating(s)} className="text-gray-300 hover:text-gold transition-colors">
                                            <Star size={24} fill={newRating >= s ? "#C6A87C" : "none"} color={newRating >= s ? "#C6A87C" : "currentColor"} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Share your experience..."
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-midnight outline-none"
                                    rows={3}
                                />
                                <div className="text-right">
                                    <button
                                        disabled={submittingReview}
                                        className="bg-gray-900 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                                    >
                                        Post Review
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {product.reviews?.map((rev, idx) => (
                            <div key={rev.id || idx} className="bg-white p-6 rounded-2xl border border-gray-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                            {rev.user?.name?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-midnight">{rev.user?.name}</p>
                                            <p className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < rev.rating ? "#C6A87C" : "none"} className={i < rev.rating ? "text-gold" : "text-gray-200"} />)}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm italic">"{rev.comment}"</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Similar Products Section */}
                {similarProducts.length > 0 && (
                    <div className="mt-24 border-t border-gray-200 pt-16">
                        <div className="flex items-center gap-2 mb-8">
                            <Sparkles size={20} className="text-gold" />
                            <h3 className="text-2xl font-playfair font-bold text-midnight">Similar Creations</h3>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map(p => (
                                <div key={p.id} className="group cursor-pointer">
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-gray-100">
                                        <img
                                            src={p.images?.[0] || DEFAULT_IMAGE}
                                            alt={p.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-md text-[10px] font-bold">
                                            {formatCurrency(p.pricePerDay)}
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-midnight text-sm truncate">{p.name}</h4>
                                    <p className="text-xs text-gray-500">{p.category}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
