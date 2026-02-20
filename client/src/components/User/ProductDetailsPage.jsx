import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Star, Heart, Share2,
    ShieldCheck, Truck, RefreshCw, ShoppingCart,
    MessageSquare, ArrowLeft, Info, Sparkles,
    Layers, Globe, Award, Scissors, TrendingUp,
    ChevronDown, X
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

    // Mobile UI States
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [openAccordion, setOpenAccordion] = useState(null); // 'specs', 'about'
    const [headerOpacity, setHeaderOpacity] = useState(0);

    // Review Form State
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Refs
    const mobileCarouselRef = useRef(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const threshold = 100;
            const opacity = Math.min(1, scrollY / threshold);
            setHeaderOpacity(opacity);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        const price = product.pricePerDay || product.price || 0;
        const rentalFee = price * rentalDays * quantity;
        const deposit = (product.securityDeposit || 0) * quantity;
        const total = rentalFee + deposit;

        // Accurate Discount Calculation
        const retailPrice = product.retailPrice || (price * 50);
        const discountVal = retailPrice > 0 ? ((retailPrice - price) / retailPrice) * 100 : 0;
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
            // Scroll to error
            if (errs.size) document.getElementById('size-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            else if (errs.date) document.getElementById('date-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        addToCart(product, startDate, endDate, size, quantity);
        toast.success('Added to your collection!');
    };

    const handleAddReview = async () => {
        if (!currentUser) { toast.info('Please login to review'); return; }
        if (!newReview.comment.trim()) return;

        setIsSubmittingReview(true);
        try {
            await submitReview(product.id, { rating: newReview.rating, comment: newReview.comment });
            toast.success('Your feedback has been published');
            setNewReview({ rating: 5, comment: '' });
            const updated = await getDetailedProduct(product.id);
            setProduct(updated);
        } catch (err) {
            toast.error('Failed to publish review');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleShare = (product) => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: `Check out this amazing ${product.name} on StyleSwap!`,
                url: window.location.href,
            })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing', error));
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.info('Link copied to clipboard!');
        }
    };

    const handleScroll = () => {
        if (mobileCarouselRef.current) {
            const scrollLeft = mobileCarouselRef.current.scrollLeft;
            const width = mobileCarouselRef.current.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setCurrentImageIndex(index);
        }
    };

    const toggleWishlist = (product) => {
        // Placeholder for wishlist logic
        setIsWishlisted(!isWishlisted);
        toast.info(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    };

    return (
        <div className="bg-[#FCFBF7] lg:bg-[#FCFBF7] min-h-screen pb-0 lg:pb-24 animate-luxury-entry">
            {/* Adaptive Mobile Header */}
            <div
                className="lg:hidden fixed top-0 left-0 right-0 z-[100] transition-colors duration-300 px-4 py-3 flex items-center justify-between"
                style={{
                    backgroundColor: `rgba(255, 255, 255, ${headerOpacity})`,
                    backdropFilter: headerOpacity > 0.5 ? 'blur(12px)' : 'none',
                    borderBottom: headerOpacity > 0.9 ? '1px solid rgba(0,0,0,0.05)' : 'none'
                }}
            >
                <button
                    onClick={onBack}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90 ${headerOpacity > 0.5 ? 'bg-gray-100 text-midnight' : 'bg-black/20 text-white'}`}
                >
                    <ArrowLeft size={20} />
                </button>

                <h1
                    className="text-[10px] font-medium text-midnight transition-opacity duration-300 truncate px-4 uppercase tracking-[0.25em]"
                    style={{ opacity: headerOpacity }}
                >
                    {product.name}
                </h1>

                <button
                    onClick={() => handleShare(product)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90 ${headerOpacity > 0.5 ? 'bg-gray-100 text-midnight' : 'bg-black/20 text-white'}`}
                >
                    <Share2 size={18} />
                </button>
            </div>

            {/* Full-screen Image Gallery Modal */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-[200] bg-white animate-luxury-entry lg:hidden">
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-white to-transparent">
                        <button onClick={() => setIsGalleryOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-midnight backdrop-blur-md">
                            <X size={20} />
                        </button>
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-midnight">
                            {currentImageIndex + 1} / {images.length}
                        </span>
                    </div>
                    <div className="h-full flex flex-col justify-center bg-gray-50">
                        <div className="relative aspect-[3/4] w-full">
                            <img
                                src={images[currentImageIndex]}
                                className="w-full h-full object-contain"
                                alt=""
                            />
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-0 right-0 px-6 flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${idx === currentImageIndex ? 'border-midnight scale-110 shadow-lg' : 'border-transparent opacity-50'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {/* Main Layout */}
            <div className="max-w-7xl mx-auto lg:px-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Column: Image Gallery (Smaller Width) */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32 h-full">
                        {/* Mobile Carousel / Desktop Main Image */}
                        <div
                            onClick={() => setIsGalleryOpen(true)}
                            className="relative aspect-[3/4] lg:rounded-[2rem] overflow-hidden bg-gray-100 border-b lg:border border-gray-100 shadow-sm group active:scale-[0.98] transition-transform lg:cursor-zoom-in"
                        >
                            {/* Mobile Swipe-able Gallery */}
                            <div
                                className="lg:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full"
                                id="mobile-gallery"
                                onScroll={(e) => {
                                    const scrollLeft = e.currentTarget.scrollLeft;
                                    const width = e.currentTarget.offsetWidth;
                                    const newIndex = Math.round(scrollLeft / width);
                                    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
                                }}
                            >
                                {images.map((img, idx) => (
                                    <div key={idx} className="flex-shrink-0 w-full h-full snap-center">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Single Image (Visible only on LG) */}
                            <img
                                src={images[currentImageIndex]}
                                alt={product.name}
                                className="hidden lg:block w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Mobile Pagination Dots */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-full z-10">
                                {images.map((_, idx) => (
                                    <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/40'}`} />
                                ))}
                            </div>
                        </div>

                        {/* Desktop Thumbnails */}
                        <div className="hidden lg:flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onMouseEnter={() => setCurrentImageIndex(idx)}
                                    className={`w-20 h-20 rounded-2xl overflow-hidden border transition-all flex-shrink-0 ${idx === currentImageIndex ? 'border-gold shadow-luxury scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Product Details (Larger Width) */}
                    <div className="lg:col-span-7 px-6 lg:px-0 space-y-4 lg:space-y-6 animate-luxury-entry">
                        {/* Header Section */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-start">
                                <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-[0.4em] font-modern">
                                    {product.category || 'Luxury Collection'}
                                </p>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FDFCF0] text-[#8B7355] rounded-full text-[9px] font-bold uppercase tracking-widest border border-[#F5F1DA]">
                                    <Star size={10} fill="currentColor" className="text-[#D4AF37]" /> {product.rating || '5.0'}
                                </div>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-luxury font-medium text-midnight leading-tight tracking-[0.02em]">
                                {product.name.split('').map((char, i) => (
                                    <span
                                        key={i}
                                        className="split-char inline-block"
                                        style={{ animationDelay: `${i * 20}ms` }}
                                    >
                                        {char === ' ' ? '\u00A0' : char}
                                    </span>
                                ))}
                            </h1>
                        </div>

                        {/* Price Section */}
                        <div className="space-y-1.5 pt-2">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl lg:text-4xl font-modern font-semibold text-[#1A1A1A] tracking-tighter">
                                    ₹{(product.pricePerDay || product.price || 0).toLocaleString()}
                                    <span className="text-sm font-light text-gray-400 ml-1.5">/day</span>
                                </span>
                                <div className="bg-[#FFF5F5] text-[#E53E3E] px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-[#FED7D7]">
                                    {stats.discount}% OFF
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-[9px] font-medium tracking-widest uppercase">
                                <span className="text-gray-400">Retail Value: <span className="text-gray-300 line-through">₹{stats.retailPrice.toLocaleString()}</span></span>
                                <span className="w-1 h-1 rounded-full bg-gray-200" />
                                <span className="text-[#8B7355] flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                                    Boutique Stock
                                </span>
                            </div>
                        </div>

                        {/* Selectors */}
                        <div className="space-y-6 pt-1">
                            {/* Size selection */}
                            <div id="size-section">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-[10px] font-bold text-midnight uppercase tracking-[0.3em] font-modern">Select Proportion</label>
                                    <button className="text-[9px] font-medium text-gold underline hover:text-midnight transition-colors tracking-[0.1em] uppercase">Size Guide</button>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {product.sizes?.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s)}
                                            className={`min-w-[4rem] px-5 py-3 rounded-2xl text-xs font-semibold border transition-all duration-500 active:scale-95 touch-manipulation font-modern ${size === s ? 'bg-midnight border-midnight text-white shadow-luxury transform -translate-y-1' : 'bg-white/50 border-gray-100 text-gray-400 hover:border-gold/30 hover:bg-white'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                                {errors.size && <p className="text-red-500 text-[9px] font-bold mt-2 uppercase tracking-widest">{errors.size}</p>}
                            </div>

                            {/* Date selection */}
                            <div className="grid grid-cols-2 gap-6" id="date-section">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-midnight uppercase tracking-[0.3em] font-modern">Start Date</label>
                                    <div className="relative group">
                                        <input
                                            type="date"
                                            value={startDate}
                                            min={today}
                                            onChange={e => setStartDate(e.target.value)}
                                            className="w-full bg-white/50 border border-gray-100 rounded-2xl px-5 py-3 text-xs font-semibold text-midnight focus:border-gold focus:ring-4 focus:ring-gold/5 outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-midnight uppercase tracking-[0.3em] font-modern">Return Date</label>
                                    <div className="relative group">
                                        <input
                                            type="date"
                                            value={endDate}
                                            min={startDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="w-full bg-white/50 border border-gray-100 rounded-2xl px-5 py-3 text-xs font-semibold text-midnight focus:border-gold focus:ring-4 focus:ring-gold/5 outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 space-y-7 border border-white/50 relative group transition-all duration-700 shadow-luxury"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;
                                e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                                e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                            }}
                        >
                            <div className="flex justify-between items-center relative z-10" >
                                <span className="text-gray-400 font-semibold text-[11px] uppercase tracking-widest font-modern">Rental Period</span>
                                <span className="bg-gold/10 text-gold px-5 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-gold/10">
                                    {stats.rentalDays} Days
                                </span>
                            </div>
                            <div className="flex justify-between items-center relative z-10">
                                <span className="text-gray-500 font-medium text-sm font-modern">Rental Fee ({stats.rentalDays}d)</span>
                                <span className="font-semibold text-midnight text-2xl tracking-tighter font-modern">₹{stats.rentalFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center relative z-10">
                                <span className="text-gray-500 font-medium text-sm font-modern flex items-center gap-2">
                                    Security Deposit <Info size={14} strokeWidth={1.5} className="text-gray-300 cursor-help" />
                                </span>
                                <span className="font-semibold text-midnight text-2xl tracking-tighter font-modern">₹{stats.deposit.toLocaleString()}</span>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent my-6 relative z-10" />

                            <div className="flex justify-between items-center relative z-10">
                                <span className="text-midnight font-bold text-xs uppercase tracking-[0.3em] font-modern">Final Valuation</span>
                                <span className="text-4xl font-semibold text-midnight tracking-tighter font-modern">₹{stats.total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Additional Details Sections (Accordions for Mobile) */}
                        <div className="space-y-4 lg:space-y-8 pt-2">
                            {/* Key Features Grid */}
                            <div className="border-b lg:border-none border-gray-100 pb-4 lg:pb-0">
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === 'specs' ? null : 'specs')}
                                    className="w-full flex items-center justify-between lg:block text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-lg font-luxury font-medium text-midnight tracking-widest text-[11px] uppercase animate-decrypt">Detailed Anatomy</h3>
                                        <div className="hidden lg:block h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
                                    </div>
                                    <ChevronDown size={14} className={`lg:hidden transition-transform duration-300 ${openAccordion === 'specs' ? 'rotate-180' : ''}`} />
                                </button>

                                <div className={`mt-6 grid grid-cols-2 gap-x-8 gap-y-6 overflow-hidden transition-all duration-500 ${openAccordion === 'specs' || window.innerWidth > 1024 ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'}`}>
                                    {[
                                        { id: 'material', label: 'Fabric', value: product.material, icon: Scissors },
                                        { id: 'length', label: 'Size Info', value: product.length, icon: Layers },
                                        { id: 'style', label: 'Style', value: product.style, icon: Award },
                                        { id: 'neck', label: 'Neckline', value: product.neck, icon: Sparkles },
                                        { id: 'pattern', label: 'Pattern', value: product.pattern, icon: TrendingUp },
                                        { id: 'heritage', label: 'Origin', value: product.heritage || 'Luxury Quality', icon: Globe }
                                    ]
                                        .filter(item => item.value)
                                        .map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 group/item">
                                                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-midnight group-hover/item:text-gold transition-colors duration-300">
                                                    <item.icon size={14} strokeWidth={2} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em] font-modern">{item.label}</span>
                                                    <span className="text-midnight font-medium text-sm font-modern">{item.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* About this item */}
                            <div className="border-b lg:border-none border-gray-100 pb-4 lg:pb-0">
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === 'about' ? null : 'about')}
                                    className="w-full flex items-center justify-between lg:block text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-lg font-luxury font-medium text-midnight tracking-widest text-[11px] uppercase">Composition & Care</h3>
                                        <div className="hidden lg:block h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
                                    </div>
                                    <ChevronDown size={16} className={`lg:hidden transition-transform duration-300 ${openAccordion === 'about' ? 'rotate-180' : ''}`} />
                                </button>

                                <div className={`mt-4 overflow-hidden transition-all duration-500 ${openAccordion === 'about' || window.innerWidth > 1024 ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'}`}>
                                    <ul className="space-y-4">
                                        {[
                                            `Curated ${product.category || 'Choice'} - Selection of refined materials.`,
                                            'Artisanal Quality - Crafted for distinguished presence.',
                                            'Bespoke Details - Unique elements for the modern wardrobe.',
                                            'Care: Professional conservation recommended.'
                                        ].map((text, idx) => (
                                            <li key={idx} className="flex gap-4 text-sm text-gray-500 leading-relaxed font-modern">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gold/30 mt-2 flex-shrink-0" />
                                                <span>{text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Sticky Bar (Refined & Compact) */}
                        <div className="fixed bottom-0 left-0 right-0 z-[60] lg:relative lg:z-0 lg:bottom-auto lg:left-auto lg:right-auto px-4 py-3 lg:px-0 lg:py-0 bg-white/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-t border-gray-100 lg:border-none shadow-[0_-10px_40px_rgba(0,0,0,0.08)] lg:shadow-none pb-safe transition-all duration-300">
                            <div className="max-w-7xl mx-auto flex items-center gap-3 pt-1 lg:pt-4">
                                {/* Selection Preview (Mobile Only) */}
                                <div className="lg:hidden flex flex-col pr-5 border-r border-gray-100">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-modern">Investment</span>
                                    <span className="text-base font-semibold text-midnight tracking-tighter font-modern">₹{stats.total.toLocaleString()}</span>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="flex-[5] bg-midnight text-white py-4 lg:py-6 rounded-xl lg:rounded-2xl font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] text-[10px] lg:text-[11px] hover:bg-gold hover:text-midnight transition-all duration-700 shadow-2xl flex items-center justify-center gap-3 lg:gap-4 group relative overflow-hidden active:scale-95 touch-manipulation border-trace"
                                >
                                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    <ShoppingCart size={18} className="relative z-10 group-hover:scale-110 transition-transform lg:w-5 lg:h-5" />
                                    <span className="relative z-10 shiny-text">Reserve Now</span>
                                </button>

                                <button className="flex-1 h-[52px] lg:h-[72px] rounded-xl lg:rounded-2xl border-2 border-gray-100 hover:border-midnight hover:bg-midnight hover:text-white transition-all duration-500 flex items-center justify-center bg-white group shadow-sm active:scale-95 touch-manipulation">
                                    <MessageSquare size={20} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform lg:w-6 lg:h-6" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Padding for Mobile Sticky Bar */}
                <div className="h-10 lg:hidden" />

                {/* Reviews Section (Editorial Style) */}
                <div className="relative z-10 bg-white/30 backdrop-blur-sm lg:bg-transparent mt-2 pt-6 px-6 lg:px-0 lg:mt-12 lg:border-t border-gray-100 lg:pt-12 transition-colors duration-500">
                    <h3 className="text-2xl font-luxury font-medium text-midnight mb-6 tracking-wide capitalize">Community Reflections</h3>

                    <div className="mb-6">
                        <h4 className="font-semibold text-sm mb-3 uppercase tracking-widest text-gray-400 font-modern">Collector Sentiment</h4>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex text-gold">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < Math.floor(product.rating || 4.5) ? "currentColor" : "none"} />
                                ))}
                            </div>
                            <span className="font-semibold text-xl font-modern">{product.rating || 4.5} <span className="text-xs text-gray-400 font-light">/ 5</span></span>
                        </div>
                        <p className="text-gray-400 text-xs tracking-wide font-modern uppercase">{product.reviews?.length || 128} Editorial Ratings</p>


                        {/* Reviews with images */}
                        <div className="mb-8">
                            <h5 className="font-bold text-lg mb-3">Reviews with images</h5>
                            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden bg-gray-100 snap-center border border-gray-200">
                                        <img src={images[i % images.length]} className="w-full h-full object-cover" alt="User Review" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Review List */}
                    <div className="space-y-8">
                        {/* Mock Amazon-style Reviews if no real reviews */}
                        {(!product.reviews || product.reviews.length === 0) && [1, 2].map(i => (
                            <div key={i} className="border-b border-gray-100 pb-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-full bg-ivory-warm border border-gray-100 flex items-center justify-center text-midnight text-[10px] font-bold font-modern">
                                        {i === 1 ? 'AG' : 'JB'}
                                    </div>
                                    <span className="font-semibold text-sm text-midnight font-modern tracking-tight">{i === 1 ? 'Abdul Gani' : 'Jayesh Badiyani'}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex text-gold text-xs">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star key={idx} size={14} fill="currentColor" />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-red-700">Verified Purchase</span>
                                </div>
                                <h5 className="font-bold text-sm mb-2">{i === 1 ? 'Beautifully Designed set' : 'Great quality'}</h5>
                                <p className="text-xs text-gray-500 mb-2">Reviewed in India on 15 January 2026</p>
                                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                    {i === 1 ? "This set is delightfully pretty. The fabric is soft, comfortable, and breathable which makes it perfect for Summers. The quality of the material is very good and it gives a nice feel." : "Excellent product quality. The fitting is perfect and the color is exactly as shown in the picture. Worth every penny."}
                                </p>
                                <div className="flex items-center gap-4">
                                    <button className="px-4 py-1.5 rounded-full border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50">Helpful</button>
                                    <button className="text-xs text-gray-500 hover:underline">Report</button>
                                </div>
                            </div>
                        ))}

                        {/* Real Reviews */}
                        {product.reviews?.map((review) => (
                            <div key={review.id} className="border-b border-gray-100 pb-6 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <img
                                        src={review.user?.avatar || "https://ui-avatars.com/api/?name=User"}
                                        alt={review.user?.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span className="font-bold text-sm text-midnight transition-colors">{review.user?.name || 'Anonymous'}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex text-gold text-xs">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-red-700">Verified Rental</span>
                                </div>
                                <h4 className="font-bold text-sm mb-2 text-midnight transition-colors">Great Experience</h4>
                                <p className="text-gray-600 text-sm leading-relaxed mb-3 transition-colors">{review.comment}</p>
                            </div>
                        ))}
                    </div>

                    {/* Add Review Button (if logged in) */}
                    {currentUser && (
                        <div className="mt-8">
                            <h4 className="font-bold text-lg mb-4">Write a review</h4>
                            {!isSubmittingReview ? (
                                <button
                                    onClick={() => setIsSubmittingReview(true)}
                                    className="w-full py-2 rounded-xl text-sm font-bold border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    Write a customer review
                                </button>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="flex gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })}>
                                                <Star size={24} className={star <= newReview.rating ? "fill-gold text-gold" : "text-gray-300"} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        placeholder="Share your thoughts..."
                                        className="w-full p-3 rounded-lg border border-gray-300 text-sm mb-3 focus:border-gold focus:outline-none"
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleAddReview} className="flex-1 bg-gold text-midnight font-bold py-2 rounded-lg text-sm">Submit</button>
                                        <button onClick={() => setIsSubmittingReview(false)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-lg text-sm">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Similar Products Section */}
                {similarProducts.length > 0 && (
                    <div className="relative z-10 bg-transparent mt-0 pt-16 pb-40 px-6 lg:px-0 lg:mt-24 lg:border-t border-gray-100 lg:pt-20 lg:pb-0 transition-colors duration-500">
                        <div className="flex items-center gap-3 mb-10">
                            <Sparkles size={18} className="text-gold" />
                            <h3 className="text-2xl font-luxury font-medium text-midnight tracking-wide capitalize">Curated Alternatives</h3>
                        </div>
                        <div className="flex overflow-x-auto gap-4 pb-4 snap-x lg:grid lg:grid-cols-4 lg:pb-0 scrollbar-hide">
                            {similarProducts.map(p => (
                                <div key={p.id} onClick={() => { window.scrollTo(0, 0); setProduct(null); }} className="group cursor-pointer min-w-[160px] snap-center lg:min-w-0">
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
                                    <h4 className="font-medium text-midnight text-sm truncate font-luxury tracking-wide">{p.name}</h4>
                                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em] font-modern mt-1">{p.category}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
