import React from 'react';
import {
    LayoutDashboard, Users, Package, BarChart2, ShoppingBag,
    ClipboardList, Warehouse, TrendingUp, Store, X, ChevronRight, CheckCircle, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'products', label: 'All Products', icon: Package },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart2 },
    { id: 'subscribers', label: 'Subscribers', icon: ClipboardList },
    { id: 'profile', label: 'Settings', icon: Settings },
];

const subAdminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
    { id: 'rentals', label: 'Active Rentals', icon: ClipboardList },
    { id: 'analytics', label: 'Sales Analytics', icon: TrendingUp },
    { id: 'profile', label: 'Settings', icon: Settings },
];

const userNav = [
    { id: 'catalog', label: 'Browse Products', icon: Store },
    { id: 'cart', label: 'My Cart', icon: ShoppingBag },
    { id: 'rentals', label: 'My Rentals', icon: ClipboardList },
];

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }) {
    const { currentUser, isAdmin, isSubAdmin } = useAuth();

    const navItems = isAdmin ? adminNav : isSubAdmin ? subAdminNav : userNav;
    const shopName = currentUser?.shopName;

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed lg:sticky top-0 lg:top-16 inset-y-0 left-0 z-40 
                    w-72 bg-midnight-deep text-white 
                    border-r border-white/5 shadow-2xl 
                    transform transition-transform duration-300 ease-in-out 
                    lg:transform-none flex flex-col
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    h-screen lg:h-[calc(100vh-4rem)]
                    backdrop-blur-3xl
                `}
            >
                {/* Mobile Header */}
                <div className="lg:hidden h-16 flex items-center justify-between px-6 border-b border-white/10 bg-midnight/50 backdrop-blur-md">
                    <span className="font-playfair font-bold text-xl text-white tracking-widest uppercase">Elite Menu</span>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Shop Profile (Sub-Admin) */}
                {shopName && (
                    <div className="mx-4 mt-8 mb-4 animate-luxury-entry">
                        <div className="p-5 bg-midnight-accent backdrop-blur-2xl rounded-3xl border border-white/10 shadow-glow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-gold/20 transition-all duration-700"></div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-14 h-14 bg-gradient-to-br from-gold via-yellow-600 to-gold-dark rounded-2xl flex items-center justify-center text-midnight shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    <Store size={26} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-base truncate text-white tracking-tight group-hover:text-gold transition-colors" title={shopName}>{shopName}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                                        <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest truncate">Verified Partner</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-8 px-5 space-y-3 custom-scrollbar">
                    {/* Section Label */}
                    <div className="px-4 mb-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] animate-luxury-entry stagger-1">
                        Workspace
                    </div>

                    {navItems.map(({ id, label, icon: Icon }, index) => {
                        const isActive = currentPage === id;
                        return (
                            <button
                                key={id}
                                onClick={() => { onNavigate(id); onClose(); }}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-500 group relative overflow-hidden animate-luxury-entry stagger-${index + 1} ${isActive
                                    ? 'bg-white/10 text-white shadow-2xl border border-white/10'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white border border-transparent'
                                    }`}
                            >
                                {/* Active Indicator Glow */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gold shadow-[0_0_20px_rgba(212,175,55,1)]" />
                                )}

                                <Icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`transition-all duration-500 z-10 ${isActive ? 'text-gold scale-110' : 'text-gray-600 group-hover:text-gold group-hover:scale-110'}`}
                                />
                                <span className={`z-10 tracking-wider transition-all duration-500 ${isActive ? 'translate-x-0' : 'group-hover:translate-x-1'}`}>{label}</span>

                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Gradient overlay */}
                <div className="h-20 bg-gradient-to-t from-midnight-deep to-transparent pointer-events-none absolute bottom-0 inset-x-0 z-20" />
            </aside>
        </>
    );
}
