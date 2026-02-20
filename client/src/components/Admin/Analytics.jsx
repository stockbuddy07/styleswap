import React, { useState, useMemo } from 'react';
import { Users, Package, DollarSign, ShoppingBag, TrendingUp, Store, ArrowUpRight, Calendar, Download } from 'lucide-react';
import { useUsers } from '../../context/UserContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { formatCurrency } from '../../utils/helpers';

function MetricCard({ icon: Icon, label, value, sub, color, trend, index }) {
    return (
        <div className={`animate-luxury-entry stagger-${index + 1} relative overflow-hidden bg-white/50 backdrop-blur-3xl border border-gray-200 rounded-[2rem] p-8 group hover:border-gold/30 transition-all duration-700 shadow-2xl`}>
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all duration-700"></div>

            <div className="relative z-10 flex items-start justify-between mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color} bg-opacity-20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl`}>
                    <Icon size={32} strokeWidth={2.5} className={color.replace('bg-', 'text-').replace('500', '400')} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1.5 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full text-[10px] font-black border border-green-500/20 shadow-lg">
                        <ArrowUpRight size={14} strokeWidth={3} />
                        {trend}
                    </div>
                )}
            </div>
            <div className="relative z-10 space-y-1">
                <p className="text-gray-500 text-[10px] font-black tracking-[0.2em] uppercase">{label}</p>
                <h3 className="text-4xl font-black text-midnight font-numeric tracking-tighter">{value}</h3>
                {sub && <p className="text-[10px] text-gray-500 font-bold uppercase mt-2 group-hover:text-gray-300 transition-colors tracking-wider">{sub}</p>}
            </div>
        </div>
    );
}

export default function Analytics() {
    const { users } = useUsers();
    const { allProducts } = useProducts();
    const { allOrders } = useOrders();

    const metrics = useMemo(() => {
        const totalUsers = users.length;
        const vendors = users.filter(u => u.role === 'Sub-Admin');
        const customers = users.filter(u => u.role === 'User');
        const totalProducts = allProducts.length;
        const activeRentals = allOrders.filter(o => o.status === 'Active').length;
        const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Revenue by month (last 6 months)
        const now = new Date();
        const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const label = d.toLocaleString('default', { month: 'short' });
            const revenue = allOrders
                .filter(o => {
                    const od = new Date(o.orderDate);
                    return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
                })
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            return { label, revenue };
        });

        // Top shops
        const shopRevenue = {};
        allOrders.forEach(o => {
            o.items?.forEach(item => {
                const vId = item.vendorId || 'unknown'; // Fallback
                if (!shopRevenue[vId]) {
                    shopRevenue[vId] = { id: vId, shopName: item.vendorShopName || 'Unknown Shop', revenue: 0, rentals: 0 };
                }
                shopRevenue[vId].revenue += item.subtotal || 0;
                shopRevenue[vId].rentals += 1;
            });
        });

        const topShops = Object.values(shopRevenue)
            .map(data => {
                const vendor = users.find(u => u.id === data.id); // Look up current vendor details
                const productCount = allProducts.filter(p => p.subAdminId === data.id).length;
                return {
                    ...data,
                    owner: vendor?.name || 'Unknown Vendor',
                    products: productCount,
                    shopName: vendor?.shopName || data.shopName // Prefer live data
                };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const maxRevenue = monthlyRevenue.length > 0
            ? Math.max(...monthlyRevenue.map(m => m.revenue), 1000)
            : 1000;

        return { totalUsers, vendors, customers, totalProducts, activeRentals, totalRevenue, monthlyRevenue, topShops, maxRevenue };
    }, [users, allProducts, allOrders]);

    return (
        <div className="min-h-screen bg-gray-50 p-6 text-midnight space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 animate-luxury-entry stagger-1">
                <div className="space-y-2">
                    <h1 className="font-playfair text-5xl font-black text-midnight tracking-tighter">Analytics & Reports</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Platform Performance Overview</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2.5 px-6 py-3.5 bg-midnight-accent border border-white/10 rounded-2xl text-[10px] font-black text-gray-400 hover:text-white transition-all backdrop-blur-3xl uppercase tracking-widest">
                        <Calendar size={18} />
                        Filter Period
                    </button>
                    <button className="flex items-center gap-2.5 px-6 py-3.5 bg-gold text-midnight rounded-2xl text-[10px] font-black hover:scale-105 hover:shadow-glow transition-all shadow-2xl uppercase tracking-widest">
                        <Download size={18} strokeWidth={3} />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <MetricCard index={0} icon={Users} label="Identity Hub" value={metrics.totalUsers}
                    sub={`${metrics.vendors.length} vendors · ${metrics.customers.length} customers`}
                    color="bg-purple-500" trend="+12%" />
                <MetricCard index={1} icon={Package} label="Curated Assets" value={metrics.totalProducts}
                    sub={`Across ${metrics.vendors.length} elite shops`}
                    color="bg-blue-500" trend="+5%" />
                <MetricCard index={2} icon={DollarSign} label="Gross Volume" value={formatCurrency(metrics.totalRevenue)}
                    sub="Total network performance"
                    color="bg-gold" trend="+8%" />
                <MetricCard index={3} icon={ShoppingBag} label="Active Rentals" value={metrics.activeRentals}
                    sub="Current lease agreements"
                    color="bg-emerald-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="xl:col-span-2 bg-midnight/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/5 p-10 animate-luxury-entry stagger-4 group hover:border-gold/20 transition-all duration-700">
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h2 className="font-playfair text-2xl font-black text-white flex items-center gap-3">
                                <TrendingUp size={24} className="text-gold" /> Market Trajectory
                            </h2>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Monthly Velocity Analysis</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(metrics.monthlyRevenue[5]?.revenue || 0)}</p>
                            <div className="flex items-center justify-end gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Forecast</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end gap-3 sm:gap-6 h-72 pt-4 px-2">
                        {metrics.monthlyRevenue.map(({ label, revenue }, i) => (
                            <div key={label} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                                <div className="relative w-full flex justify-center h-full items-end">
                                    <div className="absolute -top-12 bg-white text-midnight text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-2xl translate-y-2 group-hover:translate-y-0">
                                        {formatCurrency(revenue)}
                                    </div>
                                    <div className="w-full max-w-[50px] bg-white/5 rounded-t-2xl relative overflow-hidden h-full flex items-end border border-white/5 group-hover:border-gold/30 transition-all duration-700">
                                        <div
                                            className="w-full bg-gradient-to-t from-gold-dark via-gold to-gold-light rounded-t-xl transition-all duration-1000 ease-out shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                                            style={{ height: `${Math.max((revenue / metrics.maxRevenue) * 100, 5)}%` }}
                                        />
                                        {/* Animated Shine */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent translate-y-[100%] group-hover:translate-y-[-100%] transition-transform duration-[1.5s] ease-in-out" />
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-gray-600 group-hover:text-gold transition-colors tracking-widest uppercase">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Breakdown */}
                <div className="bg-midnight/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/5 p-10 animate-luxury-entry stagger-5 group hover:border-gold/20 transition-all duration-700">
                    <h2 className="font-playfair text-2xl font-black text-white mb-8 tracking-tight">Ecosystem Mix</h2>
                    <div className="space-y-8">
                        {[
                            { label: 'Prime Members', count: metrics.customers.length, total: metrics.totalUsers, color: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
                            { label: 'Curated Vendors', count: metrics.vendors.length, total: metrics.totalUsers, color: 'bg-gold', text: 'text-gold', glow: 'shadow-[0_0_15px_rgba(212,175,55,0.3)]' },
                            { label: 'Admins', count: users.filter(u => u.role === 'Admin').length, total: metrics.totalUsers, color: 'bg-purple-500', text: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
                        ].map((item) => (
                            <div key={item.label} className="group/bar">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                    <span className="text-gray-500 group-hover/bar:text-white transition-colors">{item.label}</span>
                                    <span className={item.text}>{item.count}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} rounded-full transition-all duration-[1.5s] ease-out ${item.glow}`}
                                        style={{ width: `${(item.count / Math.max(item.total, 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-10 border-t border-white/5">
                        <div className="p-6 rounded-[2rem] bg-midnight-accent border border-white/5 text-center group/panel hover:border-gold/30 transition-all duration-500">
                            <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/panel:scale-110 transition-transform">
                                <Store size={24} className="text-gold" />
                            </div>
                            <p className="font-black text-4xl text-white tracking-tighter">{metrics.vendors.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">Verified Partners</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Shops Table */}
            <div className="bg-midnight/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden animate-luxury-entry stagger-1 group hover:border-gold/20 transition-all duration-700">
                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="font-playfair text-2xl font-black text-white flex items-center gap-3">
                            <Store size={24} className="text-gold" /> Premium Network
                        </h2>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Highest Performing Partners</p>
                    </div>
                    <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gold hover:bg-gold hover:text-midnight transition-all uppercase tracking-widest shadow-lg">View All Partners</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Partner Identity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden sm:table-cell">Management</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center hidden md:table-cell">Inventory</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Capital Flow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {metrics.topShops.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-10 py-20 text-center text-gray-600 font-bold uppercase tracking-widest italic">Awaiting Market Activity...</td>
                                </tr>
                            ) : (
                                metrics.topShops.map((shop, i) => (
                                    <tr key={i} className="group/row hover:bg-white/5 transition-all duration-500 border-b border-white/5 last:border-0">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] flex-shrink-0 transition-transform group-hover/row:scale-110 ${i === 0 ? 'bg-gold text-midnight shadow-glow' : 'bg-white/5 text-gray-400'}`}>
                                                    0{i + 1}
                                                </div>
                                                <span className="font-bold text-white group-hover/row:text-gold transition-colors text-base tracking-tight truncate max-w-[120px] sm:max-w-none">{shop.shopName}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-sm font-bold text-gray-500 hidden sm:table-cell">{shop.owner}</td>
                                        <td className="px-10 py-6 text-center hidden md:table-cell">
                                            <span className="px-4 py-1.5 bg-midnight-accent text-white rounded-xl text-[10px] font-black border border-white/10 group-hover/row:border-gold/30 transition-all">{shop.products} SKU's</span>
                                        </td>
                                        <td className="px-10 py-6 text-right font-black text-gold text-lg tracking-tighter">{formatCurrency(shop.revenue)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
