import React, { useState, useMemo } from 'react';
import { Package, Clock, CheckCircle, AlertTriangle, ArrowRight, Search, Filter } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Button from '../Shared/Button';
import Loader from '../Shared/Loader';

const statusStyles = {
    Active: 'bg-blue-50 text-blue-700 border-blue-100',
    Returned: 'bg-green-50 text-green-700 border-green-100',
    Overdue: 'bg-red-50 text-red-700 border-red-100',
    'Pending Return': 'bg-amber-50 text-amber-700 border-amber-100',
};

const statusIcons = {
    Active: <Clock size={14} />,
    Returned: <CheckCircle size={14} />,
    Overdue: <AlertTriangle size={14} />,
    'Pending Return': <Clock size={14} />,
};

export default function OrdersDashboard({ onNavigate }) {
    const { userOrders, loading } = useOrders();
    const [filter, setFilter] = useState('All');

    const filteredOrders = useMemo(() => {
        if (filter === 'All') return userOrders;
        return userOrders.filter(o => o.status === filter);
    }, [userOrders, filter]);

    if (loading) return <Loader fullPage={false} message="Fetching your orders..." />;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 animate-fade-in">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="font-playfair text-3xl font-bold text-midnight">Your Orders</h1>
                    <p className="text-gray-500 mt-1">Track and manage your rental history.</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
                    {['All', 'Active', 'Returned', 'Overdue'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-white text-midnight shadow-sm'
                                    : 'text-gray-500 hover:text-midnight'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package size={36} className="text-gray-300" />
                    </div>
                    <h3 className="font-playfair text-xl font-semibold text-midnight mb-2">No orders found</h3>
                    <p className="text-gray-500 mb-8">It seems you haven't rented any luxury items yet.</p>
                    <Button onClick={() => onNavigate('catalog')}>Explore Collection</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredOrders.map((order) => (
                        <div key={order.orderId} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
                                        #{order.orderId?.slice(-8).toUpperCase()}
                                    </span>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {statusIcons[order.status]}
                                        {order.status}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    Placed on <span className="font-semibold text-midnight">{formatDate(order.orderDate)}</span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col md:flex-row gap-8 items-center">
                                {/* Items Stack */}
                                <div className="flex -space-x-4">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="w-20 h-20 rounded-2xl border-2 border-white overflow-hidden shadow-sm relative group-hover:-translate-y-1 transition-transform" style={{ zIndex: 10 - idx }}>
                                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>

                                {/* Order Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="font-bold text-midnight truncate max-w-md">
                                        {order.items?.map(i => i.productName).join(', ') || 'Rental Pack'}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {order.items?.length} Item{order.items?.length > 1 ? 's' : ''} · From <span className="font-medium text-midnight">{order.shopName}</span>
                                    </p>
                                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-gray-400">
                                        <div className="flex flex-col">
                                            <span className="uppercase tracking-widest text-[10px] mb-1">Duration</span>
                                            <span className="text-midnight font-bold">{formatDate(order.rentalStartDate)} - {formatDate(order.rentalEndDate)}</span>
                                        </div>
                                        <div className="flex flex-col border-l border-gray-100 pl-6">
                                            <span className="uppercase tracking-widest text-[10px] mb-1">Total Amount</span>
                                            <span className="text-midnight font-bold text-base">{formatCurrency(order.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    <Button variant="outline" className="text-xs py-2 h-10">View Details</Button>
                                    <Button className="text-xs py-2 h-10">Re-Rent Item</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
