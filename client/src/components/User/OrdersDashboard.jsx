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
        <div className="max-w-6xl mx-auto py-12 px-6 animate-luxury-entry">
            <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="font-playfair text-5xl font-black text-midnight tracking-tighter">Order Manifests</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Historical and Active Acquisition Log</p>
                </div>

                <div className="flex bg-midnight/5 backdrop-blur-xl p-1.5 rounded-2xl w-fit border border-midnight/5 shadow-inner">
                    {['All', 'Active', 'Returned', 'Overdue'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${filter === f
                                ? 'bg-midnight text-white shadow-2xl scale-105'
                                : 'text-gray-400 hover:text-midnight hover:bg-white/50'
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
                        <div key={order.orderId} className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-xl hover:shadow-2xl hover:border-gold/30 transition-all duration-700 overflow-hidden group/order">
                            <div className="px-8 py-5 bg-midnight/5 border-b border-white/40 flex flex-wrap items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Manifest ID</span>
                                        <span className="font-mono text-[10px] font-black text-midnight bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                                            #{order.orderId?.slice(-8).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Log Status</span>
                                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${statusStyles[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {statusIcons[order.status]}
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                    Validated on <span className="text-midnight font-black">{formatDate(order.orderDate).toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col lg:flex-row gap-10 items-center">
                                {/* Items Stack */}
                                <div className="flex -space-x-6">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="w-24 h-24 rounded-3xl border-4 border-white overflow-hidden shadow-2xl relative group-hover/order:-translate-y-2 transition-transform duration-700" style={{ zIndex: 10 - idx }}>
                                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover/order:opacity-100 transition-opacity duration-700" />
                                        </div>
                                    ))}
                                </div>

                                {/* Order Info */}
                                <div className="flex-1 text-center lg:text-left space-y-4">
                                    <h4 className="font-playfair text-xl font-black text-midnight truncate max-w-lg tracking-tight">
                                        {order.items?.map(i => i.productName).join(', ') || 'Rental Pack'}
                                    </h4>

                                    <div className="flex flex-wrap justify-center lg:justify-start gap-10">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Temporal Scope</span>
                                            <div className="flex items-center gap-3 bg-midnight/5 px-4 py-2 rounded-xl border border-midnight/5">
                                                <Clock size={12} className="text-gold" />
                                                <span className="text-midnight font-black text-[10px] uppercase tracking-widest">{formatDate(order.rentalStartDate).toUpperCase()} → {formatDate(order.rentalEndDate).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Financial Commitment</span>
                                            <span className="text-midnight font-black text-2xl tracking-tighter">{formatCurrency(order.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 w-full lg:w-48">
                                    <button className="w-full bg-midnight text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-midnight transition-all duration-500 shadow-xl hover:shadow-glow hover:-translate-y-1 active:translate-y-0">
                                        Access Details
                                    </button>
                                    <button className="w-full bg-white text-midnight border border-gray-100 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-gold hover:text-gold transition-all duration-500">
                                        Renew Cycle
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
