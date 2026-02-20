import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, X, Menu, LogOut, User, ChevronDown, MapPin, Heart, Bell, Zap, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FALLBACK_CATEGORIES = ['All', 'Wedding Attire', 'Blazers', 'Shoes', 'Accessories'];

export default function Header({
    onMenuToggle,
    cartCount = 0,
    onCartClick,
    searchTerm = '',
    onSearchChange,
    showSearch = false,
    categories = [],
    selectedCategory = 'All',
    onCategorySelect,
    currentPage,
    onNavigate,
}) {
    const { currentUser, logout, isUser, isAdmin, isSubAdmin } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const activeCategories = (categories && categories.length > 0) ? categories : FALLBACK_CATEGORIES;

    // Mock Location functionality
    const handleLocationClick = () => {
        if (!currentUser) {
            if (onNavigate) onNavigate('login');
        } else {
            alert('Location selection feature coming soon!');
        }
    };

    useEffect(() => {
        function handleClickOutside(e) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const roleColors = {
        Admin: 'bg-purple-100 text-purple-800',
        'Sub-Admin': 'bg-blue-100 text-blue-800',
        User: 'bg-green-100 text-green-800',
    };

    // Scroll container ref for Category Rail
    const scrollContainerRef = useRef(null);

    return (
        <div className="sticky top-0 z-[100] flex flex-col">
            {/* Top Bar - Main Header */}
            <header className="bg-white/80 backdrop-blur-2xl border-b border-gray-100 relative z-50">
                <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center gap-6">
                    {/* Mobile Menu (Only for management roles) */}
                    {(currentUser?.role === 'Admin' || currentUser?.role === 'Sub-Admin') && (
                        <button
                            onClick={onMenuToggle}
                            className="lg:hidden text-midnight hover:text-gold transition-colors p-1"
                            aria-label="Toggle menu"
                        >
                            <Menu size={20} />
                        </button>
                    )}

                    {/* Logo - click handler */}
                    <div
                        className="flex items-center gap-2 cursor-pointer flex-shrink-0 group"
                        onClick={() => onNavigate && onNavigate('home')}
                    >
                        <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center shadow-luxury transition-transform group-hover:scale-105">
                            <span className="text-midnight font-playfair font-bold text-base">S</span>
                        </div>
                        <span className="font-playfair font-bold text-midnight text-lg hidden sm:block tracking-wide">
                            Style<span className="text-gold">Swap</span>
                        </span>
                    </div>

                    {/* Admin/Vendor Badge */}
                    {(isAdmin || isSubAdmin) && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 ml-2 shadow-sm">
                            <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'} animate-pulse`} />
                            <span className="text-midnight text-[10px] font-black tracking-wider uppercase whitespace-nowrap">
                                {isAdmin ? 'Admin' : 'Vendor'}
                            </span>
                        </div>
                    )}

                    {/* Location / Delivery (Amazon Style) - Users Only */}
                    {!isAdmin && !isSubAdmin && (
                        <div
                            onClick={handleLocationClick}
                            className="hidden lg:flex flex-col leading-tight text-midnight px-2 hover:bg-gray-50 cursor-pointer rounded-xl transition-colors py-1"
                        >
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Deliver to</span>
                            <div className="flex items-center gap-1 font-bold text-xs">
                                <MapPin size={12} className="text-gold" />
                                <span>{currentUser?.name ? 'Home' : 'select location'}</span>
                            </div>
                        </div>
                    )}

                    {/* Mega Search Bar (User only) */}
                    {showSearch && !isAdmin && !isSubAdmin && (
                        <div className="flex-1 max-w-2xl mx-auto hidden md:flex h-11 rounded-full overflow-hidden focus-within:ring-4 focus-within:ring-gold/10 shadow-sm transition-all duration-500 bg-gray-50 border border-gray-100 group/search">
                            {/* Input Container with Typewriter Placeholder */}
                            <div className="flex-1 bg-transparent relative flex items-center">
                                <Search size={16} className="absolute left-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                                    className="w-full h-full pl-12 pr-5 text-midnight text-xs font-semibold focus:outline-none z-10 bg-transparent placeholder-transparent"
                                />
                                {!searchTerm && (
                                    <div className="absolute left-12 pointer-events-none group-focus-within/search:opacity-20 transition-opacity">
                                        <TypewriterPlaceholder />
                                    </div>
                                )}
                            </div>

                            {/* Clear Button */}
                            {searchTerm && (
                                <button
                                    onClick={() => onSearchChange && onSearchChange('')}
                                    className="bg-transparent px-3 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}

                            {/* Search Button */}
                            <button className="bg-gold px-5 hover:bg-midnight hover:text-white transition-all duration-500 flex items-center justify-center group/btn">
                                <Search size={16} className="text-midnight group-hover/btn:text-white group-hover/btn:scale-110 transition-transform" />
                            </button>
                        </div>
                    )}

                    {/* Right Features */}
                    <div className="ml-auto flex items-center gap-1 sm:gap-4">
                        {/* Guest actions */}
                        {!currentUser && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onNavigate && onNavigate('login')}
                                    className="text-midnight hover:text-gold font-bold text-[10px] uppercase tracking-widest transition-colors py-2 px-3"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => onNavigate && onNavigate('register')}
                                    className="bg-midnight text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold hover:text-midnight transition-all shadow-sm"
                                >
                                    Join
                                </button>
                            </div>
                        )}

                        {/* User Actions */}
                        {currentUser && (
                            <>
                                {/* Account Menu */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setUserMenuOpen(v => !v)}
                                        className="hidden sm:flex flex-col items-start leading-tight text-midnight py-1 px-3 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Hello, {currentUser.name.split(' ')[0]}</span>
                                        <span className="font-bold text-xs flex items-center gap-0.5">
                                            Account & Lists <ChevronDown size={10} className="text-gray-400" />
                                        </span>
                                    </button>

                                    {/* Mobile User Icon */}
                                    <button
                                        onClick={() => setUserMenuOpen(v => !v)}
                                        className="sm:hidden text-midnight p-2"
                                    >
                                        <User size={20} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-3xl shadow-luxury border border-gray-100 py-3 z-50 animate-luxury-entry">
                                            <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 rounded-t-3xl">
                                                <p className="font-playfair text-xl font-black text-midnight truncate tracking-tight">{currentUser.name}</p>
                                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 truncate">{currentUser.email}</p>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isAdmin ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gold/10 text-gold border-gold/20'}`}>
                                                        {currentUser.role}
                                                    </span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                </div>
                                            </div>

                                            <div className="py-3 px-2 space-y-1">
                                                <div className="px-5 py-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Identity & Controls</div>
                                                <button onClick={() => { onNavigate('profile'); setUserMenuOpen(false); }} className="w-full text-left px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-midnight flex items-center gap-3 transition-all group">
                                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gold group-hover:text-midnight transition-all">
                                                        <User size={14} />
                                                    </div>
                                                    {(isAdmin || isSubAdmin) ? 'System Settings' : 'Identity Profile'}
                                                </button>
                                                {!(isAdmin || isSubAdmin) && (
                                                    <>
                                                        <button onClick={() => { onNavigate('orders'); setUserMenuOpen(false); }} className="w-full text-left px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-midnight flex items-center gap-3 transition-all group">
                                                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gold group-hover:text-midnight transition-all">
                                                                <Bell size={14} />
                                                            </div>
                                                            Order Manifests
                                                        </button>
                                                        <button onClick={() => { onNavigate('wishlist'); setUserMenuOpen(false); }} className="w-full text-left px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-midnight flex items-center gap-3 transition-all group">
                                                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gold group-hover:text-midnight transition-all">
                                                                <Heart size={14} />
                                                            </div>
                                                            Curated Desires
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            <div className="border-t border-gray-100 pt-2 px-2">
                                                <button
                                                    onClick={() => { setUserMenuOpen(false); logout(); }}
                                                    className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                                                >
                                                    <LogOut size={16} strokeWidth={3} />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </>
                        )}

                        {/* Cart */}
                        {isUser && onCartClick && (
                            <button
                                onClick={onCartClick}
                                className="relative flex items-end gap-1 text-midnight hover:text-gold transition-colors p-2"
                                aria-label={`Cart (${cartCount} items)`}
                            >
                                <div className="relative">
                                    <ShoppingCart size={24} />
                                    <span className="absolute -top-1.5 -right-1.5 bg-midnight text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-lg border border-white">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                </div>
                                <span className="font-bold text-xs mb-0.5 hidden sm:block">Cart</span>
                            </button>
                        )}

                    </div>
                </div>

                {/* Mobile Search - Expanded */}
                {showSearch && !isAdmin && !isSubAdmin && (
                    <div className="md:hidden px-6 pb-4">
                        <div className="relative flex h-10 rounded-full overflow-hidden shadow-sm bg-gray-50 border border-gray-100">
                            <div className="flex-1 relative flex items-center px-4">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                                    className="w-full h-full text-midnight text-xs font-semibold focus:outline-none z-10 bg-transparent"
                                />
                                {!searchTerm && (
                                    <div className="absolute left-4 pointer-events-none">
                                        <TypewriterPlaceholder />
                                    </div>
                                )}
                            </div>
                            <button className="bg-gold px-4 flex items-center justify-center">
                                <Search size={16} className="text-midnight" />
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Quick Categories Rail */}
            {(!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Sub-Admin')) && (
                <div className="bg-white/90 backdrop-blur-xl text-midnight overflow-x-auto scrollbar-hide border-t border-gray-100 z-10 shadow-sm" ref={scrollContainerRef}>
                    <div className="max-w-screen-2xl mx-auto px-6 h-10 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                        {activeCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => onCategorySelect && onCategorySelect(cat)}
                                className={`h-full hover:bg-gray-50/10 transition-all relative group flex items-center px-5`}
                            >
                                <span className={`relative py-1 ${selectedCategory === cat ? 'text-gold' : 'text-midnight/60 group-hover:text-midnight'}`}>
                                    {cat === 'All' ? <><Menu size={14} className="inline mr-2" /> All</> : cat.toUpperCase()}
                                    {selectedCategory === cat && (
                                        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold" />
                                    )}
                                </span>
                            </button>
                        ))}

                        <button
                            onClick={() => onCategorySelect && onCategorySelect('Great Deals')}
                            className={`px-6 h-full text-gold hover:bg-gold hover:text-midnight transition-all ml-auto border-l border-gray-100 group ${selectedCategory === 'Great Deals' ? 'bg-gold text-midnight' : ''}`}
                        >
                            <span className="flex items-center gap-2">
                                <Zap size={12} className={selectedCategory === 'Great Deals' ? 'animate-pulse' : ''} fill="currentColor" />
                                Exclusive Yields
                            </span>
                        </button>
                        <button
                            onClick={() => onCategorySelect && onCategorySelect('Customer Service')}
                            className="px-6 h-full hover:text-gold transition-all text-gray-400 border-l border-gray-100"
                        >
                            Concierge
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const SEARCH_PHRASES = [
    "ACCESSORIES",
    "BLAZERS",
    "LUXURY BAGS",
    "SHOES",
    "WATCHES",
    "WEDDING ATTIRE"
];

function TypewriterPlaceholder() {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(100);

    useEffect(() => {
        let timer;
        const currentPhrase = SEARCH_PHRASES[currentPhraseIndex];

        const handleTyping = () => {
            if (isDeleting) {
                setCurrentText(currentPhrase.substring(0, currentText.length - 1));
                setTypingSpeed(40); // Faster deletion
            } else {
                setCurrentText(currentPhrase.substring(0, currentText.length + 1));
                setTypingSpeed(100); // Standard typing
            }

            // State Transitions
            if (!isDeleting && currentText === currentPhrase) {
                // Pause at the end of the phrase
                timer = setTimeout(() => setIsDeleting(true), 2500);
            } else if (isDeleting && currentText === "") {
                // Pause before starting the next phrase
                setIsDeleting(false);
                setCurrentPhraseIndex((prev) => (prev + 1) % SEARCH_PHRASES.length);
                timer = setTimeout(() => { }, 500);
            } else {
                // Continue typing/deleting
                timer = setTimeout(handleTyping, typingSpeed);
            }
        };

        timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentPhraseIndex, typingSpeed]);

    return (
        <span className="text-midnight text-[11px] font-bold uppercase tracking-widest whitespace-nowrap flex items-center gap-1">
            {currentText}
            <span className="w-1.5 h-4 bg-gold animate-pulse rounded-sm"></span>
        </span>
    );
}
