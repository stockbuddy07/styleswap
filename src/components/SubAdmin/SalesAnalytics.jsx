import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';

export default function SalesAnalytics() {
    const { currentUser } = useAuth();
    const { myProducts } = useProducts();
    const { allOrders } = useOrders();

    const vendorOrders = useMemo(() =>
        allOrders.filter(o => o.items?.some(i => i.vendorId === currentUser?.id)),
        [allOrders, currentUser]
    );

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

        const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

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
        <div className="space-y-6">
            <div>
                <h1 className="font-playfair text-2xl font-bold text-midnight">Sales Analytics</h1>
                <p className="text-gray-500 text-sm mt-1">Your shop's performance overview</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: DollarSign, label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), color: 'bg-gold' },
                    { icon: TrendingUp, label: 'This Month', value: formatCurrency(stats.thisMonthRevenue), color: 'bg-green-500' },
                    { icon: ShoppingBag, label: 'Avg Order Value', value: formatCurrency(stats.avgOrderValue), color: 'bg-blue-500' },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                            <Icon size={22} className="text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-midnight">{value}</p>
                            <p className="text-gray-500 text-sm">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="font-playfair text-lg font-semibold text-midnight mb-6">Revenue (6 months)</h2>
                    <div className="flex items-end gap-3 h-40">
                        {stats.monthlyRevenue.map(({ label, revenue }) => (
                            <div key={label} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-500">{revenue > 0 ? formatCurrency(revenue) : ''}</span>
                                <div className="w-full bg-lightGold rounded-t-md relative" style={{ height: '120px' }}>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gold rounded-t-md transition-all duration-500"
                                        style={{ height: `${(revenue / stats.maxRevenue) * 100}%` }} />
                                </div>
                                <span className="text-xs text-gray-600 font-medium">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="font-playfair text-lg font-semibold text-midnight mb-4">Top Products</h2>
                    {stats.topProducts.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-2 text-gray-500 font-medium">Product</th>
                                        <th className="text-right py-2 text-gray-500 font-medium">Rentals</th>
                                        <th className="text-right py-2 text-gray-500 font-medium">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topProducts.map((p, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-3 font-medium text-midnight text-xs">{p.name}</td>
                                            <td className="py-3 text-right text-gray-600">{p.rentals}</td>
                                            <td className="py-3 text-right font-semibold text-midnight">{formatCurrency(p.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
