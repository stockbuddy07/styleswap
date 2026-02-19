import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, X, Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header({
    onMenuToggle,
    cartCount = 0,
    onCartClick,
    searchTerm = '',
    onSearchChange,
    showSearch = false,
    currentPage,
    onNavigate,
}) {
    const { currentUser, logout, isUser } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

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

    return (
        <header className="sticky top-0 z-40 bg-midnight shadow-lg">
            <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center gap-4">
                {/* Hamburger (mobile) */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden text-white hover:text-gold transition-colors p-1"
                    aria-label="Toggle menu"
                >
                    <Menu size={24} />
                </button>

                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer flex-shrink-0"
                    onClick={() => onNavigate && onNavigate('home')}
                >
                    <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                        <span className="text-midnight font-playfair font-bold text-sm">S</span>
                    </div>
                    <span className="font-playfair font-bold text-white text-lg hidden sm:block">
                        Style<span className="text-gold">Swap</span>
                    </span>
                </div>

                {/* Search Bar (User only) */}
                {showSearch && (
                    <div className="flex-1 max-w-xl mx-auto hidden md:block">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                                placeholder="Search for wedding attire, shoes, accessories..."
                                className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:bg-opacity-20 transition-all text-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => onSearchChange && onSearchChange('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="ml-auto flex items-center gap-3">
                    {/* Cart (User only) */}
                    {isUser && onCartClick && (
                        <button
                            onClick={onCartClick}
                            className="relative text-white hover:text-gold transition-colors p-2"
                            aria-label={`Cart (${cartCount} items)`}
                        >
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gold text-midnight text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* User Menu or Guest Buttons */}
                    {currentUser ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(v => !v)}
                                className="flex items-center gap-2 text-white hover:text-gold transition-colors py-1 px-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                                aria-label="User menu"
                                aria-expanded={userMenuOpen}
                            >
                                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-midnight font-bold text-sm">
                                    {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                                    {currentUser?.name}
                                </span>
                                <ChevronDown size={16} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="font-semibold text-midnight text-sm truncate">{currentUser?.name}</p>
                                        <p className="text-gray-500 text-xs truncate">{currentUser?.email}</p>
                                        <span className={`badge mt-1 text-xs ${roleColors[currentUser?.role]}`}>
                                            {currentUser?.role}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => { setUserMenuOpen(false); logout(); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onNavigate && onNavigate('login')}
                                className="text-white hover:text-gold font-medium text-sm transition-colors"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => onNavigate && onNavigate('register')}
                                className="bg-gold text-midnight px-4 py-2 rounded-lg font-bold text-sm hover:bg-white transition-colors shadow-lg"
                            >
                                Join Now
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile search */}
            {showSearch && (
                <div className="md:hidden px-4 pb-3">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                            placeholder="Search products..."
                            className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => onSearchChange && onSearchChange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
