import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Star, Heart, Share2, Info, ShoppingCart, MessageSquare, ChevronDown, Scissors, Layers, Award, Sparkles, TrendingUp, Globe, ArrowLeft, ArrowDown, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../Shared/Loader';
import { formatCurrency, getTodayString, DEFAULT_IMAGE } from '../../utils/helpers';

export default function ProductDetailsPage({ productId, onBack, onNavigate }) {
    const { addToCart, cartCount } = useCart();
    const { getDetailedProduct, submitReview, allProducts } = useProducts();
    const { currentUser } = useAuth();
    const { toggleWishlist, isInWishlist } = useWishlist();
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
    const isWishlisted = product ? isInWishlist(product.id) : false;

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
        if (!currentUser) {
            toast.info('Initiate session to lock your manifest');
            onNavigate && onNavigate('login');
            return;
        }
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
        toast.success('Asset locked in manifest!');

        if (onNavigate) {
            onNavigate('cart');
        }
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


    return (
        <>
            <div className="bg-[#FCFBF7] lg:bg-[#FCFBF7] min-h-screen pb-0 lg:pb-24 animate-luxury-entry">
                {/* Adaptive Mobile Header */}
                <div
                    className="md:hidden fixed top-0 left-0 right-0 z-[100] transition-colors duration-300 px-4 py-3 flex items-center justify-between"
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
                <div className="max-w-[1400px] mx-auto md:px-6 md:py-6 relative z-10 transition-colors duration-500 bg-white md:bg-transparent">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                        {/* Left Column: Image Gallery (Span 4) */}
                        <div className="md:col-span-1 lg:col-span-4 flex flex-col md:flex-row gap-4">
                            {/* Desktop Thumbnails (Vertical on Left) */}
                            <div className="hidden md:flex flex-col gap-3 overflow-y-auto max-h-[600px] scrollbar-hide py-1">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onMouseEnter={() => setCurrentImageIndex(idx)}
                                        className={`w-12 h-16 rounded overflow-hidden border transition-all flex-shrink-0 bg-white ${idx === currentImageIndex ? 'border-amber-500 shadow-sm scale-105' : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300'}`}
                                    >
                                        <img src={img} className="w-full h-full object-contain" alt="" />
                                    </button>
                                ))}
                            </div>

                            {/* Main Image Base */}
                            <div
                                onClick={() => setIsGalleryOpen(true)}
                                className="flex-1 relative aspect-[3/4] md:rounded-lg lg:rounded-none overflow-hidden bg-white border-b md:border border-gray-100 md:cursor-zoom-in group z-10"
                            >
                                {/* Mobile Swipe-able Gallery */}
                                <div
                                    className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full"
                                    id="mobile-gallery"
                                    onScroll={handleScroll}
                                    ref={mobileCarouselRef}
                                >
                                    {images.map((img, idx) => (
                                        <div key={idx} className="flex-shrink-0 w-full h-full snap-center bg-gray-50 flex items-center justify-center">
                                            <img src={img} className="max-w-full max-h-full object-contain mix-blend-multiply" alt="" />
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Single Image */}
                                <img
                                    src={images[currentImageIndex]}
                                    alt={product.name}
                                    className="hidden md:block w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
                                />

                                {/* Mobile Pagination Dots */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-full z-20">
                                    {images.map((_, idx) => (
                                        <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/40'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Middle Column: Product Info (Span 5) */}
                        <div className="md:col-span-1 lg:col-span-5 px-4 lg:px-0 space-y-4">
                            {/* Header / Brand / Title / Ratings */}
                            <div className="border-b border-gray-200 pb-4 space-y-1.5">
                                <a href="#" className="text-gray-400 hover:text-[#C7511F] hover:underline text-sm font-semibold inline-block">Brand: {product.vendor?.shopName || 'StyleSwap Elite'}</a>
                                <h1 className="text-xl lg:text-[22px] leading-tight text-midnight font-bold tracking-tight">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4 text-sm mt-1">
                                    <div className="flex items-center text-[#DE7921]">
                                        {product.rating || '4.0'} <Star size={14} fill="currentColor" className="ml-1" />
                                        <div className="mx-2 hover:underline hover:text-[#C7511F] cursor-pointer text-[#007185] flex items-center gap-1">
                                            <ChevronDown size={12} className="text-gray-400" />
                                            {product.reviews?.length || 2764} ratings
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-700 mt-2">500+ bought in past month</p>
                            </div>

                            {/* Price & Offers */}
                            <div className="py-2 space-y-2 border-b border-gray-200">
                                {stats.discount > 0 && <span className="bg-[#CC0C39] text-white px-2 py-1 text-xs font-bold rounded-sm inline-block mb-1">Limited time deal</span>}
                                <div className="flex items-end gap-3 mt-1">
                                    {stats.discount > 0 && <span className="text-3xl font-light text-[#CC0C39]">-{(stats.discount || 0)}%</span>}
                                    <span className="text-3xl font-medium text-gray-900 flex items-start">
                                        <span className="text-sm mt-1">₹</span>
                                        {(product.pricePerDay || product.price || 0).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">M.R.P.: <span className="line-through">₹{stats.retailPrice.toLocaleString()}</span></p>
                                <p className="text-sm font-bold text-gray-900 mt-1">Inclusive of all taxes</p>

                                {/* Offer Cards */}
                                <div className="mt-5">
                                    <div className="flex items-center gap-2 font-bold mb-3 text-sm text-gray-900">
                                        <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-[10px]">%</div>
                                        Offers
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {['Cashback', 'Partner Offers'].map((offer, i) => (
                                            <div key={i} className="min-w-[130px] border border-gray-200 rounded-lg p-3 shadow-sm bg-white">
                                                <h4 className="text-sm font-bold mb-1">{offer}</h4>
                                                <p className="text-xs text-gray-700 line-clamp-3 mb-2">Upto ₹{(i + 1) * 500} discount on select Credit Cards</p>
                                                <a href="#" className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline">{i + 1} offer &gt;</a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Services/Perks */}
                            <div className="flex items-center justify-center gap-10 overflow-x-auto py-5 border-b border-gray-200 scrollbar-hide text-center px-2">
                                {[
                                    { icon: '✨', label: 'Best Quality' },
                                    { icon: '💰', label: 'Affordable Price' },
                                    { icon: '✔️', label: 'StyleSwap Verified' },
                                ].map((s, i) => (
                                    <div key={i} className="flex flex-col items-center min-w-[80px] group">
                                        <div className="w-10 h-10 border border-gold/40 rounded-full flex items-center justify-center mb-1.5 text-lg bg-gold/5 group-hover:border-gold group-hover:bg-gold/20 transition-colors shadow-sm">{s.icon}</div>
                                        <span className="text-[11px] font-semibold text-gray-800 leading-tight group-hover:text-midnight transition-colors whitespace-pre-wrap">{s.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Selectors */}
                            <div className="py-4 space-y-6 border-b border-gray-200">
                                {/* Size */}
                                <div id="size-section">
                                    <div className="mb-2">
                                        <span className="text-sm text-gray-600">Size: <span className="font-bold text-gray-900">{size || 'Select'}</span></span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-1">
                                        {product.sizes?.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setSize(s)}
                                                className={`min-w-[44px] h-9 px-3 rounded-md text-sm border focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors ${size === s ? 'border-amber-500 bg-amber-50/20 shadow-[0_0_4px_rgba(230,122,0,0.3)] ring-1 ring-amber-500' : 'border-gray-300 hover:bg-gray-100'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.size && <p className="text-[#CC0C39] text-xs font-bold mt-1.5 flex items-center gap-1"><Info size={14} />{errors.size}</p>}
                                    <a href="#" className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline mt-1 inline-block font-medium">Size Chart <ChevronDown size={12} className="inline" /></a>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4" id="date-section">
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">Start Date</span>
                                        <input type="date" value={startDate} min={today} onChange={e => setStartDate(e.target.value)} className="w-full border border-gray-400 rounded-md p-2 text-sm focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 outline-none shadow-sm hover:border-gray-500 transition-colors" />
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">Return Date</span>
                                        <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className="w-full border border-gray-400 rounded-md p-2 text-sm focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 outline-none shadow-sm hover:border-gray-500 transition-colors" />
                                    </div>
                                </div>
                                {errors.date && <p className="text-[#CC0C39] text-xs font-bold mt-1.5 flex items-center gap-1"><Info size={14} />{errors.date}</p>}

                                {/* Details list */}
                                <div className="pt-2">
                                    <h3 className="font-bold text-sm mb-3 text-gray-900">Product details</h3>
                                    <div className="grid grid-cols-[140px_1fr] gap-y-2.5 text-sm">
                                        <div className="font-bold text-gray-700">Material type</div> <div className="text-gray-900">{product.material || 'Premium Fabric'}</div>
                                        <div className="font-bold text-gray-700">Length</div> <div className="text-gray-900">{product.length || 'Standard Length'}</div>
                                        <div className="font-bold text-gray-700">Style</div> <div className="text-gray-900">{product.style || product.category || 'Apparel'}</div>
                                        <div className="font-bold text-gray-700">Country of Origin</div> <div className="text-gray-900">{product.heritage || 'India'}</div>
                                    </div>
                                </div>

                                <div className="pt-2 space-y-2">
                                    <h3 className="font-bold text-sm text-gray-900 mb-2">About this item</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1.5 text-gray-800 marker:text-gray-800">
                                        {product.description.split('\n').filter(p => p.trim()).map((para, i) => (
                                            <li key={i}>{para}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Buy Box (Span 3) */}
                        <div className="md:col-span-2 lg:col-span-3 px-4 lg:px-0 mt-6 md:mt-0">
                            <div className="border border-gray-300 rounded-lg p-4 bg-white lg:sticky lg:top-24 mt-2 lg:mt-0 max-w-full lg:max-w-sm mx-auto shadow-sm">
                                <span className="text-2xl font-medium text-gray-900 flex items-start leading-none h-[28px]">
                                    <span className="text-sm mt-0.5">₹</span>
                                    {stats.total.toLocaleString()}
                                </span>
                                <div className="text-xs text-gray-500 mb-3 mt-1">Total Rental Estimation</div>

                                {currentUser?.address?.toLowerCase().includes('surat') ? (
                                    <>
                                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 mb-6 group transition-all hover:bg-emerald-100">
                                            <p className="text-sm font-bold text-emerald-900 flex items-center gap-3">
                                                <div className="flex items-center justify-center w-6 h-6 bg-emerald-200 rounded-full shrink-0">
                                                    <CheckCircle size={14} className="text-emerald-700" />
                                                </div>
                                                <span>Delivery starting soon to your door step.</span>
                                            </p>
                                        </div>
                                        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Vendor Spotlight</h4>
                                            <div className="flex items-center gap-3 mb-3">
                                                <img src={product.vendor?.avatar || "https://ui-avatars.com/api/?name=Vendor"} className="w-10 h-10 rounded-full object-cover border border-white shadow-sm" alt="" />
                                                <div>
                                                    <p className="text-sm font-bold text-midnight">{product.vendor?.shopName || 'Luxury Curator'}</p>
                                                    <p className="text-[10px] text-gray-500 font-medium">Professional Excellence</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed italic border-l-2 border-gold/30 pl-3">
                                                "{product.vendor?.shopDescription || 'A dedicated curator of fine luxury assets for the StyleSwap community.'}"
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6 group transition-all hover:bg-amber-100">
                                        <p className="text-sm font-bold text-amber-900 flex items-center gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 bg-amber-200 rounded-full shrink-0">
                                                <Globe size={14} className="text-amber-700" />
                                            </div>
                                            <span>Not deliverable, coming to your location soon.</span>
                                        </p>
                                    </div>
                                )}

                                <h3 className="text-lg font-medium text-[#007600] mb-3">In stock</h3>

                                <div className="text-xs text-gray-600 grid grid-cols-[65px_1fr] gap-y-1.5 mb-5">
                                    <span>Ships from</span> <span className="text-gray-900 font-medium">StyleSwap Fulfilled</span>
                                    <span>Sold by</span> <span className="text-[#007185] hover:underline cursor-pointer">{product.vendor?.shopName || 'Retail Partners'}</span>
                                    <span>Payment</span> <span className="text-[#007185] hover:underline cursor-pointer">Secure transaction</span>
                                </div>

                                {/* Quantity */}
                                <div className="mb-4">
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        className="w-full bg-[#f0f2f2] hover:bg-[#e3e6e6] border border-gray-300 text-sm rounded-lg py-1.5 px-2.5 shadow-sm outline-none focus:ring-2 focus:ring-[#007185] focus:border-[#007185] transition-colors"
                                    >
                                        {[...Array(Math.min(10, product.availableQuantity || 5))].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>Quantity: {i + 1}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <button onClick={handleAddToCart} className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-[13px] py-2 px-4 rounded-full border border-[#FCD200] shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-colors text-center">
                                        Add to cart
                                    </button>
                                    <button onClick={handleAddToCart} className="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-[#0F1111] text-[13px] py-2 px-4 rounded-full border border-[#FF8F00] shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-colors text-center">
                                        Buy Now
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-900 mb-4 px-1">
                                    <input type="checkbox" id="gift" className="rounded-sm border-gray-400 text-[#007185] focus:ring-[#007185]" />
                                    <label htmlFor="gift">Add gift options</label>
                                </div>

                                <div className="border-t border-gray-200 mt-2">
                                    <button
                                        onClick={() => toggleWishlist(product)}
                                        className="w-full text-left py-2 px-3 mt-3 text-[13px] rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 transition-colors shadow-sm"
                                    >
                                        {isWishlisted ? '✓ Pinned to Wish List' : 'Add to Wish List'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Padding for Mobile Sticky Bar */}
                    <div className="h-24 md:hidden" />

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
                                            <img src={images[i % images.length]} loading="lazy" decoding="async" className="w-full h-full object-cover" alt="User Review" />
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
                                                loading="lazy"
                                                decoding="async"
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
            </div >

            {/* Mobile Fixed Twin-Button Bar (Hidden on Desktop) */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 py-4 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] pb-safe md:hidden transition-all duration-300">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 h-12 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] rounded-full font-medium text-[13px] border border-[#FCD200] shadow-sm transition-colors"
                    >
                        Add to cart
                    </button>

                    <button
                        onClick={handleAddToCart}
                        className="flex-1 h-12 bg-[#FFA41C] hover:bg-[#FA8900] text-[#0F1111] rounded-full font-medium text-[13px] border border-[#FF8F00] shadow-sm transition-colors"
                    >
                        Buy Now
                    </button>

                    <button
                        onClick={() => {
                            if (onNavigate) {
                                onNavigate('cart');
                            }
                        }}
                        className="w-14 h-14 rounded-2xl border border-white/10 hover:bg-gold hover:text-midnight transition-all duration-500 flex items-center justify-center bg-midnight text-white group shadow-xl active:scale-95 touch-manipulation shrink-0 relative"
                    >
                        <ShoppingBag size={22} strokeWidth={2} className="group-hover:rotate-12 transition-transform" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-midnight text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div >
        </>
    );
}
