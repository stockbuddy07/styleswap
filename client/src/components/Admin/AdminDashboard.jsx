import React, { useMemo } from 'react';
import {
    Users, Package, DollarSign, ShoppingBag, Store,
    TrendingUp, AlertCircle, CheckCircle, Clock, ArrowRight,
    Activity, Calendar, CreditCard, ChevronRight
} from 'lucide-react';
import { useUsers } from '../../context/UserContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import Loader from '../Shared/Loader';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

function KPICard({ icon: Icon, label, value, sub, trend, index }) {
    return (
        <div className={`animate-luxury-entry stagger-${index + 1} relative overflow-hidden bg-midnight/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 group hover:border-gold/30 transition-all duration-700`}>
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all duration-700"></div>

            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
                    <h3 className="text-4xl font-black text-midnight font-numeric tracking-tighter">{value}</h3>
                    {sub && (
                        <div className="flex items-center gap-2 pt-1">
                            {trend !== undefined && (
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${trend > 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                                </span>
                            )}
                            <p className="text-[10px] text-gray-500 font-bold uppercase transition-colors">{sub}</p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-gold shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Icon size={24} strokeWidth={2.5} />
                </div>
            </div>
        </div>
    );
}

const statusColors = {
    Active: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Returned: 'bg-green-500/20 text-green-300 border-green-500/30',
    Overdue: 'bg-red-500/20 text-red-300 border-red-500/30',
    Cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function AdminDashboard() {
    const { currentUser } = useAuth();
    const { users, loading: usersLoading } = useUsers();
    const { allProducts, loading: productsLoading } = useProducts();
    const { allOrders, loading: ordersLoading } = useOrders();

    const loading = usersLoading || productsLoading || ordersLoading;

    const stats = useMemo(() => {
        const vendors = users.filter(u => u.role === 'Sub-Admin');
        const customers = users.filter(u => u.role === 'User');
        const activeRentals = allOrders.filter(o => o.status === 'Active');
        const overdueRentals = allOrders.filter(o => o.status === 'Overdue');
        const totalRevenue = allOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        const todayRevenue = allOrders
            .filter(o => new Date(o.orderDate).toDateString() === new Date().toDateString())
            .reduce((s, o) => s + (o.totalAmount || 0), 0);

        // Calculate real trends
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const currentMonthRevenue = allOrders
            .filter(o => new Date(o.orderDate) >= startOfCurrentMonth)
            .reduce((s, o) => s + (o.totalAmount || 0), 0);
        const lastMonthRevenue = allOrders
            .filter(o => {
                const d = new Date(o.orderDate);
                return d >= startOfLastMonth && d < startOfCurrentMonth;
            })
            .reduce((s, o) => s + (o.totalAmount || 0), 0);

        const revenueTrend = lastMonthRevenue === 0 ? (currentMonthRevenue > 0 ? 100 : 0) : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1);

        const currentMonthUsers = users.filter(u => new Date(u.createdAt) >= startOfCurrentMonth).length;
        const lastMonthUsers = users.filter(u => {
            const d = new Date(u.createdAt);
            return d >= startOfLastMonth && d < startOfCurrentMonth;
        }).length;

        const userTrend = lastMonthUsers === 0 ? (currentMonthUsers > 0 ? 100 : 0) : ((currentMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1);

        // Vendors with incomplete profiles
        const incompleteVendors = vendors.filter(v =>
            !v.shopAddress || !v.shopNumber || !v.mobileNumber || !v.salesHandlerMobile
        );

        // Recent orders (last 5)
        const recentOrders = [...allOrders]
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);

        // Vendor performance
        const vendorStats = vendors.map(v => ({
            ...v,
            productCount: allProducts.filter(p => p.subAdminId === v.id).length,
            orderCount: allOrders.filter(o => o.vendorId === v.id).length,
            revenue: allOrders
                .filter(o => o.vendorId === v.id)
                .reduce((s, o) => s + (o.totalAmount || 0), 0),
        })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        return {
            vendors, customers, activeRentals, overdueRentals,
            totalRevenue, todayRevenue, incompleteVendors, recentOrders, vendorStats,
            revenueTrend, userTrend
        };
    }, [users, allProducts, allOrders]);

    return (
        <div className="min-h-screen bg-gray-50 p-6 text-midnight space-y-8 font-sans">
            {loading && <Loader fullPage={false} message="Gathering insights..." />}

            {!loading && (
                <>
                    {/* Welcome Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
                        <div>
                            <h1 className="font-playfair text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                                Welcome back, {currentUser?.name?.split(' ')[0]}
                            </h1>
                            <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm">
                                <Calendar size={14} className="text-gold" />
                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                Platform Overview
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex-1 sm:flex-none px-4 py-2 bg-white/50 hover:bg-white/10 text-midnight text-sm font-medium rounded-xl border border-gray-200 transition-colors backdrop-blur-sm whitespace-nowrap">
                                Download Report
                            </button>
                            <button className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-gold to-yellow-600 text-midnight text-sm font-bold rounded-xl shadow-glow hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap">
                                + Add New User
                            </button>
                        </div>
                    </div>

                    {/* Alerts Section (Floating) */}
                    {(stats.overdueRentals.length > 0 || stats.incompleteVendors.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats.overdueRentals.length > 0 && (
                                <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-md">
                                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 shrink-0 animate-pulse">
                                        <AlertCircle size={20} />
                                    </div>
                                    <span className="text-red-200 font-medium text-sm">
                                        Action Required: <span className="text-white font-bold">{stats.overdueRentals.length} rentals</span> are overdue.
                                    </span>
                                    <ChevronRight size={16} className="ml-auto text-red-400" />
                                </div>
                            )}
                            {stats.incompleteVendors.length > 0 && (
                                <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl backdrop-blur-md">
                                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 shrink-0">
                                        <Store size={20} />
                                    </div>
                                    <span className="text-amber-200 font-medium text-sm">
                                        Profile Alert: <span className="text-white font-bold">{stats.incompleteVendors.length} vendors</span> have incomplete profiles.
                                    </span>
                                    <ChevronRight size={16} className="ml-auto text-amber-400" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* KPI Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        <KPICard
                            index={0}
                            icon={DollarSign}
                            label="Total Revenue"
                            value={formatCurrency(stats.totalRevenue)}
                            sub={`Today: ${formatCurrency(stats.todayRevenue)}`}
                            trend={stats.revenueTrend}
                        />
                        <KPICard
                            index={1}
                            icon={Users}
                            label="Total Users"
                            value={users.length}
                            sub={`${stats.customers.length} Customers`}
                            trend={stats.userTrend}
                        />
                        <KPICard
                            index={2}
                            icon={ShoppingBag}
                            label="Active Rentals"
                            value={stats.activeRentals.length}
                            sub="Currently rented out"
                            trend={5.4}
                        />
                        <KPICard
                            index={3}
                            icon={Store}
                            label="Active Vendors"
                            value={stats.vendors.length}
                            sub={`${allProducts.length} Products Listed`}
                            trend={2.1}
                        />
                    </div>

                    {/* Main Content Split */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                        {/* Left Column: Recent Activity (2 Cols Wide) */}
                        <div className="xl:col-span-2 space-y-8 animate-luxury-entry stagger-4">

                            {/* Visual Chart Placeholder */}
                            <div className="bg-midnight/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-gold/20 transition-all duration-700">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="font-playfair text-xl font-bold text-white">Revenue Overview</h2>
                                        <p className="text-gray-400 text-xs mt-1">Monthly performance</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors">Weekly</button>
                                        <button className="px-3 py-1 bg-gold text-midnight font-bold rounded-lg text-xs shadow-glow">Monthly</button>
                                    </div>
                                </div>

                                {/* CSS-only Bar Chart Mockup */}
                                <div className="h-48 flex items-end justify-between gap-1 sm:gap-4 px-2">
                                    {[35, 55, 40, 70, 50, 85, 60, 75, 50, 65, 80, 95].map((h, i) => (
                                        <div key={i} className="w-full bg-white/5 rounded-t-lg relative group h-full flex items-end">
                                            <div
                                                className="w-full bg-gradient-to-t from-gold/50 to-gold rounded-t-lg transition-all duration-500 group-hover:from-gold group-hover:to-yellow-300 relative"
                                                style={{ height: `${h}%` }}
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-midnight text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {h}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4 text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider overflow-x-auto scrollbar-hide">
                                    <span className="min-w-[30px] text-center">Jan</span><span className="min-w-[30px] text-center">Feb</span><span className="min-w-[30px] text-center">Mar</span><span className="min-w-[30px] text-center">Apr</span><span className="min-w-[30px] text-center">May</span><span className="min-w-[30px] text-center">Jun</span>
                                    <span className="min-w-[30px] text-center">Jul</span><span className="min-w-[30px] text-center">Aug</span><span className="min-w-[30px] text-center">Sep</span><span className="min-w-[30px] text-center">Oct</span><span className="min-w-[30px] text-center">Nov</span><span className="min-w-[30px] text-center">Dec</span>
                                </div>
                            </div>

                            {/* Recent Orders Table */}
                            <div className="bg-midnight/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 group hover:border-gold/20 transition-all duration-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                            <CreditCard size={20} />
                                        </div>
                                        <h2 className="font-bold text-lg text-white">Recent Transactions</h2>
                                    </div>
                                    <button className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1">
                                        VIEW ALL <ArrowRight size={12} />
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
                                                <th className="pb-3 pl-2">Customer</th>
                                                <th className="pb-3 hidden sm:table-cell">Order Info</th>
                                                <th className="pb-3 text-right">Amount</th>
                                                <th className="pb-3 text-right pr-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {stats.recentOrders.map(order => (
                                                <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                                                    <td className="py-4 pl-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold border border-white/10">
                                                                {order.customerName.charAt(0)}
                                                            </div>
                                                            <span className="font-medium text-sm text-gray-200 group-hover:text-white">{order.customerName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-sm text-gray-400 hidden sm:table-cell">
                                                        {order.shopName} · <span className="text-xs">{formatDate(order.orderDate)}</span>
                                                    </td>
                                                    <td className="py-4 text-right font-bold text-sm text-gray-200">
                                                        {formatCurrency(order.totalAmount)}
                                                    </td>
                                                    <td className="py-4 text-right pr-2">
                                                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColors[order.status]}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Vendors & Insights */}
                        <div className="space-y-8 animate-luxury-entry stagger-5">

                            {/* Top Vendors */}
                            <div className="bg-midnight/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 group hover:border-gold/20 transition-all duration-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                            <Store size={20} />
                                        </div>
                                        <h2 className="font-bold text-lg text-white">Top Vendors</h2>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {stats.vendorStats.map((v, i) => (
                                        <div key={v.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-gold text-midnight shadow-glow' :
                                                    i === 1 ? 'bg-gray-300 text-midnight' :
                                                        i === 2 ? 'bg-orange-400 text-midnight' : 'bg-white/10 text-gray-400'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-200 group-hover:text-white">{v.shopName}</p>
                                                    <p className="text-xs text-gray-500">{v.productCount} Items</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gold font-bold text-sm">{formatCurrency(v.revenue)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {stats.vendorStats.length === 0 && (
                                        <p className="text-center text-gray-500 text-sm py-4">No vendor data available.</p>
                                    )}
                                </div>

                                <button className="w-full mt-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white border border-white/5 transition-colors">
                                    VIEW ALL VENDORS
                                </button>
                            </div>

                            {/* System Status (Mock) */}
                            <div className="bg-gradient-to-br from-midnight-deep to-[#1e1e2e] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden group hover:border-gold/20 transition-all duration-700">
                                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Activity size={18} className="text-blue-400" /> System Health
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Server Status</span>
                                        <span className="flex items-center gap-1.5 text-green-400 font-bold text-xs">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                            Operational
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Database</span>
                                        <span className="text-green-400 font-bold text-xs">Connected</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
                                        <span>Last backup: 2 hours ago</span>
                                        <span>v2.4.0</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
