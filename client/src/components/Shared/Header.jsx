import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, X, Menu, LogOut, User, ChevronDown, MapPin, Heart, Bell } from 'lucide-react';
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
    const { currentUser, logout, isUser } = useAuth();
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
        <div className="sticky top-0 z-40 flex flex-col">
            {/* Top Bar - Main Header */}
            <header className="bg-midnight shadow-lg relative z-20">
                <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center gap-4">
                    {/* Mobile Menu (Only for management roles) */}
                    {(currentUser?.role === 'Admin' || currentUser?.role === 'Sub-Admin') && (
                        <button
                            onClick={onMenuToggle}
                            className="lg:hidden text-white hover:text-gold transition-colors p-1"
                            aria-label="Toggle menu"
                        >
                            <Menu size={24} />
                        </button>
                    )}

                    {/* Logo - click handler */}
                    <div
                        className="flex items-center gap-2 cursor-pointer flex-shrink-0 group"
                        onClick={() => onNavigate && onNavigate('home')}
                    >
                        <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center shadow-glow transition-transform group-hover:scale-105">
                            <span className="text-midnight font-playfair font-bold text-lg">S</span>
                        </div>
                        <span className="font-playfair font-bold text-white text-xl hidden sm:block tracking-wide">
                            Style<span className="text-gold">Swap</span>
                        </span>
                    </div>

                    {/* Location / Delivery (Amazon Style) */}
                    <div
                        onClick={handleLocationClick}
                        className="hidden lg:flex flex-col leading-tight text-white px-2 hover:outline hover:outline-1 hover:outline-white cursor-pointer rounded-sm"
                    >
                        <span className="text-xs text-gray-300 pl-4">Deliver to</span>
                        <div className="flex items-center gap-1 font-bold text-sm">
                            <MapPin size={14} className="text-white" />
                            <span>{currentUser?.name ? 'Home' : 'select location'}</span>
                        </div>
                    </div>

                    {/* Mega Search Bar (User only) */}
                    {showSearch && (
                        <div className="flex-1 max-w-2xl mx-auto hidden md:flex h-10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-gold shadow-sm">
                            {/* Category Dropdown */}
                            <div className="bg-gray-100 border-r border-gray-300 relative group max-w-[150px]">
                                <select
                                    className="appearance-none bg-transparent h-full pl-3 pr-8 text-xs font-medium text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-200 w-full truncate"
                                    value={activeCategories.includes(selectedCategory) ? selectedCategory : 'All'}
                                    onChange={(e) => onCategorySelect && onCategorySelect(e.target.value)}
                                >
                                    {activeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {/* Input */}
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                                placeholder="Search by name, description..."
                                className="flex-1 px-4 text-midnight text-sm placeholder-gray-500 focus:outline-none"
                            />

                            {/* Clear Button */}
                            {searchTerm && (
                                <button
                                    onClick={() => onSearchChange && onSearchChange('')}
                                    className="bg-white px-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}

                            {/* Search Button */}
                            <button className="bg-gold px-5 hover:bg-yellow-500 transition-colors flex items-center justify-center">
                                <Search size={22} className="text-midnight" />
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
                                    className="text-white hover:text-gold font-medium text-sm transition-colors py-2 px-1"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => onNavigate && onNavigate('register')}
                                    className="bg-gold text-midnight px-4 py-2 rounded-lg font-bold text-sm hover:bg-white hover:shadow-glow transition-all"
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
                                        className="hidden sm:flex flex-col items-start leading-tight text-white py-1 px-2 hover:outline hover:outline-1 hover:outline-white rounded-sm"
                                    >
                                        <span className="text-xs text-gray-300">Hello, {currentUser.name.split(' ')[0]}</span>
                                        <span className="font-bold text-sm flex items-center gap-0.5">
                                            Account & Lists <ChevronDown size={12} />
                                        </span>
                                    </button>

                                    {/* Mobile User Icon */}
                                    <button
                                        onClick={() => setUserMenuOpen(v => !v)}
                                        className="sm:hidden text-white"
                                    >
                                        <User size={24} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up">
                                            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                                                <p className="font-semibold text-midnight truncate">{currentUser.name}</p>
                                                <p className="text-gray-500 text-xs truncate">{currentUser.email}</p>
                                                <span className={`badge mt-1 text-xs ${roleColors[currentUser.role]}`}>
                                                    {currentUser.role}
                                                </span>
                                            </div>

                                            <div className="py-2">
                                                <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Your Account</div>
                                                <button onClick={() => onNavigate('profile')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold flex items-center gap-2">
                                                    Your Profile
                                                </button>
                                                <button onClick={() => onNavigate('orders')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold flex items-center gap-2">
                                                    Your Orders
                                                </button>
                                                <button onClick={() => onNavigate('wishlist')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold flex items-center gap-2">
                                                    Your Wishlist
                                                </button>
                                            </div>

                                            <div className="border-t border-gray-100 pt-2">
                                                <button
                                                    onClick={() => { setUserMenuOpen(false); logout(); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    Sign Out
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
                                className="relative flex items-end gap-1 text-white hover:text-gold transition-colors p-2"
                                aria-label={`Cart (${cartCount} items)`}
                            >
                                <div className="relative">
                                    <ShoppingCart size={28} />
                                    <span className="absolute -top-1 -right-1 bg-gold text-midnight text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                </div>
                                <span className="font-bold text-sm mb-1 hidden sm:block">Cart</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Search - Expanded */}
                {showSearch && (
                    <div className="md:hidden px-4 pb-3">
                        <div className="relative flex h-10 rounded-lg overflow-hidden shadow-sm">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                                placeholder="Search by name, description..."
                                className="flex-1 px-4 text-midnight text-sm placeholder-gray-500 focus:outline-none"
                            />
                            <button className="bg-gold px-4 flex items-center justify-center">
                                <Search size={20} className="text-midnight" />
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Quick Categories Rail (Amazon/Flipkart Style) */}
            <div className="bg-midnight/95 text-white shadow-md overflow-x-auto scrollbar-hide border-t border-white/10 z-10" ref={scrollContainerRef}>
                <div className="max-w-screen-2xl mx-auto px-4 h-10 flex items-center gap-1 text-sm font-medium whitespace-nowrap">
                    {activeCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => onCategorySelect && onCategorySelect(cat)}
                            className={`px-3 h-full hover:text-gold hover:bg-white/5 transition-colors ${selectedCategory === cat ? 'text-gold border-b-2 border-gold' : ''}`}
                        >
                            {cat === 'All' ? <><Menu size={16} className="inline mr-1" /> All</> : cat}
                        </button>
                    ))}

                    <button
                        onClick={() => onCategorySelect && onCategorySelect('Great Deals')}
                        className={`px-3 h-full text-gold hover:text-white hover:bg-white/5 transition-colors font-bold ml-auto ${selectedCategory === 'Great Deals' ? 'border-b-2 border-gold' : ''}`}
                    >
                        Great Deals
                    </button>
                    <button
                        onClick={() => onCategorySelect && onCategorySelect('Customer Service')}
                        className="px-3 h-full hover:text-gold hover:bg-white/5 transition-colors"
                    >
                        Customer Service
                    </button>
                </div>
            </div>
        </div>
    );
}
