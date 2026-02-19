import React, { useMemo } from 'react';
import {
    Users, Package, DollarSign, ShoppingBag, Store,
    TrendingUp, AlertCircle, CheckCircle, Clock, ArrowRight
} from 'lucide-react';
import { useUsers } from '../../context/UserContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { formatCurrency, formatDate } from '../../utils/helpers';

function KPICard({ icon: Icon, label, value, sub, color, bg }) {
    return (
        <div className={`rounded-2xl p-5 flex items-start gap-4 ${bg}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-midnight">{value}</p>
                <p className="text-gray-600 text-sm mt-0.5">{label}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

const statusColors = {
    Active: 'bg-blue-100 text-blue-700',
    Returned: 'bg-green-100 text-green-700',
    Overdue: 'bg-red-100 text-red-700',
    Cancelled: 'bg-gray-100 text-gray-600',
};

export default function AdminDashboard() {
    const { users } = useUsers();
    const { allProducts } = useProducts();
    const { allOrders } = useOrders();

    const stats = useMemo(() => {
        const vendors = users.filter(u => u.role === 'Sub-Admin');
        const customers = users.filter(u => u.role === 'User');
        const activeRentals = allOrders.filter(o => o.status === 'Active');
        const overdueRentals = allOrders.filter(o => o.status === 'Overdue');
        const totalRevenue = allOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        const todayRevenue = allOrders
            .filter(o => new Date(o.orderDate).toDateString() === new Date().toDateString())
            .reduce((s, o) => s + (o.totalAmount || 0), 0);

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
        })).sort((a, b) => b.revenue - a.revenue);

        return {
            vendors, customers, activeRentals, overdueRentals,
            totalRevenue, todayRevenue, incompleteVendors, recentOrders, vendorStats,
        };
    }, [users, allProducts, allOrders]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-playfair text-2xl font-bold text-midnight">Admin Overview</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Platform snapshot — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Alerts */}
            {(stats.overdueRentals.length > 0 || stats.incompleteVendors.length > 0) && (
                <div className="space-y-2">
                    {stats.overdueRentals.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm">
                            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                            <span className="text-red-700 font-medium">
                                {stats.overdueRentals.length} overdue rental{stats.overdueRentals.length > 1 ? 's' : ''} need attention
                            </span>
                        </div>
                    )}
                    {stats.incompleteVendors.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                            <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
                            <span className="text-amber-700 font-medium">
                                {stats.incompleteVendors.length} vendor{stats.incompleteVendors.length > 1 ? 's have' : ' has'} incomplete shop profiles
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <KPICard icon={Users} label="Total Users" value={users.length}
                    sub={`${stats.vendors.length} vendors · ${stats.customers.length} customers`}
                    color="bg-purple-500" bg="bg-purple-50" />
                <KPICard icon={Package} label="Products Listed" value={allProducts.length}
                    sub={`Across ${stats.vendors.length} shops`}
                    color="bg-blue-500" bg="bg-blue-50" />
                <KPICard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats.totalRevenue)}
                    sub={`Today: ${formatCurrency(stats.todayRevenue)}`}
                    color="bg-yellow-500" bg="bg-yellow-50" />
                <KPICard icon={ShoppingBag} label="Active Rentals" value={stats.activeRentals.length}
                    sub={stats.overdueRentals.length > 0 ? `${stats.overdueRentals.length} overdue` : 'All on time'}
                    color="bg-green-500" bg="bg-green-50" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gold" />
                            <h2 className="font-semibold text-midnight">Recent Orders</h2>
                        </div>
                        <span className="text-xs text-gray-400">{allOrders.length} total</span>
                    </div>
                    {stats.recentOrders.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentOrders.map(order => (
                                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-midnight">{order.customerName}</p>
                                        <p className="text-xs text-gray-400">{order.shopName} · {formatDate(order.orderDate)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-sm font-semibold text-midnight">{formatCurrency(order.totalAmount)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Vendor Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Store size={16} className="text-gold" />
                        <h2 className="font-semibold text-midnight">Vendor Performance</h2>
                    </div>
                    {stats.vendorStats.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No vendors yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.vendorStats.map(v => {
                                const isComplete = v.shopAddress && v.shopNumber && v.mobileNumber && v.salesHandlerMobile;
                                return (
                                    <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center gap-2">
                                            {isComplete
                                                ? <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                                : <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
                                            }
                                            <div>
                                                <p className="text-sm font-medium text-midnight">{v.shopName}</p>
                                                <p className="text-xs text-gray-400">{v.productCount} products · {v.orderCount} orders</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-midnight">{formatCurrency(v.revenue)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Completed Rentals', value: allOrders.filter(o => o.status === 'Returned').length, icon: CheckCircle, color: 'text-green-600' },
                    { label: 'Active Rentals', value: stats.activeRentals.length, icon: TrendingUp, color: 'text-blue-600' },
                    { label: 'Overdue', value: stats.overdueRentals.length, icon: AlertCircle, color: 'text-red-600' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                        <Icon size={20} className={`${color} mx-auto mb-2`} />
                        <p className="text-2xl font-bold text-midnight">{value}</p>
                        <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
