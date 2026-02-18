import React, { useMemo } from 'react';
import { Package, AlertTriangle, XCircle, ArrowUpDown } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { formatCurrency } from '../../utils/helpers';

function StatCard({ icon: Icon, label, value, color, bgColor }) {
    return (
        <div className={`${bgColor} rounded-xl p-5 flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-white bg-opacity-30`}>
                <Icon size={22} className="text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-white text-opacity-80 text-sm">{label}</p>
            </div>
        </div>
    );
}

export default function InventoryDashboard() {
    const { myProducts } = useProducts();
    const { vendorOrders } = useOrders();

    const stats = useMemo(() => {
        const total = myProducts.length;
        const lowStock = myProducts.filter(p => p.availableQuantity > 0 && p.availableQuantity < 3).length;
        const outOfStock = myProducts.filter(p => p.availableQuantity === 0).length;
        return { total, lowStock, outOfStock };
    }, [myProducts]);

    const getStatusInfo = (p) => {
        if (p.availableQuantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' };
        if (p.availableQuantity < 3) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' };
        return { label: 'In Stock', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' };
    };

    const getRentedCount = (productId) => {
        let rented = 0;
        vendorOrders.filter(o => o.status === 'Active').forEach(o => {
            o.items?.forEach(i => { if (i.productId === productId) rented += i.quantity; });
        });
        return rented;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-playfair text-2xl font-bold text-midnight">Inventory Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Track your stock levels and availability</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={Package} label="Total Products" value={stats.total} bgColor="bg-blue-500" color="text-blue-500" />
                <StatCard icon={AlertTriangle} label="Low Stock" value={stats.lowStock} bgColor="bg-yellow-500" color="text-yellow-500" />
                <StatCard icon={XCircle} label="Out of Stock" value={stats.outOfStock} bgColor="bg-red-500" color="text-red-500" />
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-playfair text-lg font-semibold text-midnight">Stock Levels</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Total</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Available</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Rented</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myProducts.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No products yet</td></tr>
                            ) : myProducts.map(p => {
                                const status = getStatusInfo(p);
                                const rented = getRentedCount(p.id);
                                return (
                                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${status.dot} flex-shrink-0`} />
                                                <div>
                                                    <div className="font-medium text-midnight">{p.name}</div>
                                                    <div className="text-gray-400 text-xs">{p.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600">{p.stockQuantity}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-midnight">{p.availableQuantity}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{rented}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`badge ${status.color}`}>{status.label}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
