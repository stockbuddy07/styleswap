import React from 'react';
import {
    LayoutDashboard, Users, Package, BarChart2, ShoppingBag,
    ClipboardList, Warehouse, TrendingUp, Store, X
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
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-midnight z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Mobile close */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
                    aria-label="Close sidebar"
                >
                    <X size={20} />
                </button>

                {/* Shop name (Sub-Admin) */}
                {shopName && (
                    <div className="px-4 py-4 border-b border-white border-opacity-10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center flex-shrink-0">
                                <Store size={16} className="text-midnight" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold truncate">{shopName}</p>
                                <p className="text-gray-400 text-xs">Vendor Dashboard</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    <ul className="space-y-1">
                        {navItems.map(({ id, label, icon: Icon }) => {
                            const isActive = currentPage === id;
                            return (
                                <li key={id}>
                                    <button
                                        onClick={() => { onNavigate(id); onClose(); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                            ? 'bg-gold text-midnight'
                                            : 'text-gray-300 hover:bg-white hover:bg-opacity-10 hover:text-white'
                                            }`}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        <Icon size={18} />
                                        {label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-white border-opacity-10">
                    <p className="text-gray-500 text-xs text-center">StyleSwap © 2026</p>
                </div>
            </aside>
        </>
    );
}
