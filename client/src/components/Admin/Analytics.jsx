import React, { useState, useMemo } from 'react';
import { Users, Package, DollarSign, ShoppingBag, TrendingUp, Store } from 'lucide-react';
import { useUsers } from '../../context/UserContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { formatCurrency } from '../../utils/helpers';

function MetricCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={22} className="text-white" />
            </div>
            <div>
                <p className="text-3xl font-bold text-midnight">{value}</p>
                <p className="text-gray-600 text-sm mt-0.5">{label}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
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
                if (!shopRevenue[item.vendorId]) {
                    shopRevenue[item.vendorId] = { shopName: item.vendorShopName, revenue: 0, rentals: 0 };
                }
                shopRevenue[item.vendorId].revenue += item.subtotal || 0;
                shopRevenue[item.vendorId].rentals += 1;
            });
        });
        const topShops = Object.entries(shopRevenue)
            .map(([id, data]) => {
                const vendor = vendors.find(v => v.id === id);
                return { ...data, owner: vendor?.name || 'Unknown', products: allProducts.filter(p => p.subAdminId === id).length };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

        return { totalUsers, vendors, customers, totalProducts, activeRentals, totalRevenue, monthlyRevenue, topShops, maxRevenue };
    }, [users, allProducts, allOrders]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-playfair text-2xl font-bold text-midnight">Platform Analytics</h1>
                <p className="text-gray-500 text-sm mt-1">Marketplace-wide performance overview</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard icon={Users} label="Total Users" value={metrics.totalUsers}
                    sub={`${metrics.vendors.length} vendors · ${metrics.customers.length} customers`}
                    color="bg-purple-500" />
                <MetricCard icon={Package} label="Total Products" value={metrics.totalProducts}
                    sub={`Across ${metrics.vendors.length} vendor shops`}
                    color="bg-blue-500" />
                <MetricCard icon={DollarSign} label="Platform Revenue" value={formatCurrency(metrics.totalRevenue)}
                    sub="All-time rental income"
                    color="bg-gold" />
                <MetricCard icon={ShoppingBag} label="Active Rentals" value={metrics.activeRentals}
                    sub="Currently ongoing"
                    color="bg-green-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp size={18} className="text-gold" />
                        <h2 className="font-playfair text-lg font-semibold text-midnight">Revenue Trend (6 months)</h2>
                    </div>
                    <div className="flex items-end gap-3 h-40">
                        {metrics.monthlyRevenue.map(({ label, revenue }) => (
                            <div key={label} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-500">{revenue > 0 ? formatCurrency(revenue) : ''}</span>
                                <div className="w-full bg-lightGold rounded-t-md relative" style={{ height: '120px' }}>
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-gold rounded-t-md transition-all duration-500"
                                        style={{ height: `${(revenue / metrics.maxRevenue) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-600 font-medium">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Shops */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Store size={18} className="text-gold" />
                        <h2 className="font-playfair text-lg font-semibold text-midnight">Top Performing Shops</h2>
                    </div>
                    {metrics.topShops.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-2 text-gray-500 font-medium">Shop</th>
                                        <th className="text-right py-2 text-gray-500 font-medium">Products</th>
                                        <th className="text-right py-2 text-gray-500 font-medium">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.topShops.map((shop, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-3">
                                                <div className="font-medium text-midnight">{shop.shopName}</div>
                                                <div className="text-gray-400 text-xs">{shop.owner}</div>
                                            </td>
                                            <td className="py-3 text-right text-gray-600">{shop.products}</td>
                                            <td className="py-3 text-right font-semibold text-midnight">{formatCurrency(shop.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* User breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="font-playfair text-lg font-semibold text-midnight mb-4">User Breakdown</h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                        { label: 'Admins', count: users.filter(u => u.role === 'Admin').length, color: 'text-purple-600 bg-purple-50' },
                        { label: 'Vendors', count: metrics.vendors.length, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Customers', count: metrics.customers.length, color: 'text-green-600 bg-green-50' },
                    ].map(({ label, count, color }) => (
                        <div key={label} className={`rounded-xl p-4 ${color.split(' ')[1]}`}>
                            <p className={`text-3xl font-bold ${color.split(' ')[0]}`}>{count}</p>
                            <p className="text-gray-600 text-sm mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
