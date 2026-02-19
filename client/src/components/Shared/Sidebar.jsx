import React from 'react';
import {
    LayoutDashboard, Users, Package, BarChart2, ShoppingBag,
    ClipboardList, Warehouse, TrendingUp, Store, X, Settings, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'products', label: 'All Products', icon: Package },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart2 },
];

const subAdminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
    { id: 'rentals', label: 'Active Rentals', icon: ClipboardList },
    { id: 'analytics', label: 'Sales Analytics', icon: TrendingUp },
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
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Mobile Header */}
                <div className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-gray-100">
                    <span className="font-playfair font-bold text-xl text-midnight">Menu</span>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Shop Profile (Sub-Admin) */}
                {shopName && (
                    <div className="p-4 mx-3 mt-3 bg-gradient-to-br from-midnight to-blue-900 rounded-xl text-white shadow-soft">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                <Store size={20} className="text-gold" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm truncate">{shopName}</p>
                                <p className="text-blue-200 text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map(({ id, label, icon: Icon }) => {
                        const isActive = currentPage === id;
                        return (
                            <button
                                key={id}
                                onClick={() => { onNavigate(id); onClose(); }}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-gold/10 text-midnight ring-1 ring-gold/20'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-midnight'
                                    }`}
                            >
                                <Icon
                                    size={20}
                                    className={`transition-colors ${isActive ? 'text-gold' : 'text-gray-400 group-hover:text-gold'}`}
                                />
                                {label}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold shadow-glow" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-gray-100 space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                        <Settings size={18} />
                        Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                        <HelpCircle size={18} />
                        Help Center
                    </button>
                </div>
            </aside>
        </>
    );
}
