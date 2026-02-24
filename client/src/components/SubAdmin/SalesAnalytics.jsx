import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, ArrowUpRight, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { formatCurrency } from '../../utils/helpers';

function StatCard({ icon: Icon, label, value, sub, color, trend, index }) {
    return (
        <div className={`animate-luxury-entry stagger-${index + 1} relative overflow-hidden bg-midnight/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 group hover:border-gold/30 transition-all duration-700 shadow-2xl`}>
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
                <h3 className="text-4xl font-black text-white font-numeric tracking-tighter">{value}</h3>
                {sub && <p className="text-[10px] text-gray-500 font-bold uppercase mt-2 group-hover:text-gray-300 transition-colors tracking-wider">{sub}</p>}
            </div>
        </div>
    );
}

export default function SalesAnalytics() {
    const { currentUser } = useAuth();
    const { myProducts } = useProducts();
    const { vendorOrders } = useOrders();

    const stats = useMemo(() => {
        let totalRevenue = 0;
        let thisMonthRevenue = 0;
        const productRevenue = {};
        const productRentals = {};
        const now = new Date();

        vendorOrders.forEach(order => {
            order.items?.filter(i => i.vendorId === currentUser?.id).forEach(item => {
                totalRevenue += item.subtotal || 0;
                const od = new Date(order.orderDate);
                if (od.getMonth() === now.getMonth() && od.getFullYear() === now.getFullYear()) {
                    thisMonthRevenue += item.subtotal || 0;
                }
                productRevenue[item.productId] = (productRevenue[item.productId] || 0) + (item.subtotal || 0);
                productRentals[item.productId] = (productRentals[item.productId] || 0) + 1;
            });
        });

        const avgOrderValue = vendorOrders.length > 0 ? totalRevenue / vendorOrders.length : 0;

        // Monthly revenue (last 6 months)
        const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const label = d.toLocaleString('default', { month: 'short' });
            const revenue = vendorOrders
                .filter(o => {
                    const od = new Date(o.orderDate);
                    return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
                })
                .reduce((sum, o) => {
                    return sum + (o.items?.filter(i => i.vendorId === currentUser?.id).reduce((s, i) => s + (i.subtotal || 0), 0) || 0);
                }, 0);
            return { label, revenue };
        });

        const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1000);

        // Top products
        const topProducts = myProducts
            .map(p => ({
                name: p.name,
                rentals: productRentals[p.id] || 0,
                revenue: productRevenue[p.id] || 0,
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return { totalRevenue, thisMonthRevenue, avgOrderValue, monthlyRevenue, maxRevenue, topProducts };
    }, [vendorOrders, myProducts, currentUser]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight-deep to-midnight p-6 text-white space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 animate-luxury-entry stagger-1">
                <div className="space-y-2">
                    <h1 className="font-playfair text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tighter">Sales Analytics</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Shop Performance Analysis</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <StatCard index={0} icon={DollarSign} label="Gross Lifetime" value={formatCurrency(stats.totalRevenue)}
                    sub="Total network earnings"
                    color="bg-gold" trend="+15%" />
                <StatCard index={1} icon={TrendingUp} label="Current Velocity" value={formatCurrency(stats.thisMonthRevenue)}
                    sub="Revenue this month"
                    color="bg-emerald-500" trend="+8%" />
                <StatCard index={2} icon={ShoppingBag} label="Avg Yield" value={formatCurrency(stats.avgOrderValue)}
                    sub="Revenue per order"
                    color="bg-blue-500" />
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
                            <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(stats.thisMonthRevenue)}</p>
                            <div className="flex items-center justify-end gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Forecast</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end gap-3 sm:gap-6 h-72 pt-4 px-2">
                        {stats.monthlyRevenue.map(({ label, revenue }, i) => (
                            <div key={label} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                                <div className="relative w-full flex justify-center h-full items-end">
                                    <div className="absolute -top-12 bg-white text-midnight text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-2xl translate-y-2 group-hover:translate-y-0">
                                        {formatCurrency(revenue)}
                                    </div>
                                    <div className="w-full max-w-[50px] bg-white/5 rounded-t-2xl relative overflow-hidden h-full flex items-end border border-white/5 group-hover:border-gold/30 transition-all duration-700">
                                        <div
                                            className="w-full bg-gradient-to-t from-gold-dark via-gold to-gold-light rounded-t-xl transition-all duration-1000 ease-out shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                                            style={{ height: `${Math.max((revenue / stats.maxRevenue) * 100, 5)}%` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent translate-y-[100%] group-hover:translate-y-[-100%] transition-transform duration-[1.5s] ease-in-out" />
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-gray-600 group-hover:text-gold transition-colors tracking-widest uppercase">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-midnight/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/5 p-10 animate-luxury-entry stagger-5 group hover:border-gold/20 transition-all duration-700">
                    <h2 className="font-playfair text-2xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
                        <Store size={24} className="text-gold" /> Best Sellers
                    </h2>
                    {stats.topProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3 border border-dashed border-white/10 rounded-2xl">
                            <ShoppingBag size={40} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Sales...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {stats.topProducts.map((p, i) => (
                                <div key={i} className="group/item">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                        <span className="text-gray-500 group-hover/item:text-white transition-colors truncate max-w-[120px]">{p.name}</span>
                                        <span className="text-gold">{formatCurrency(p.revenue)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gold rounded-full transition-all duration-1000"
                                                style={{ width: `${(p.revenue / (stats.topProducts[0]?.revenue || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-600">{p.rentals} sold</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
