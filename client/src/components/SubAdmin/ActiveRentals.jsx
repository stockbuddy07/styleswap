import React, { useMemo } from 'react';
import { ClipboardList, AlertTriangle, Clock, User, ShieldCheck } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

function SummaryCard({ label, count, index }) {
    return (
        <div className={`animate-luxury-entry stagger-${index + 1} bg-midnight/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 text-center group hover:border-gold/30 transition-all duration-700 shadow-xl`}>
            <p className="text-3xl font-black text-white font-numeric tracking-tighter mb-1">{count}</p>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-gold transition-colors">{label}</p>
        </div>
    );
}

export default function ActiveRentals() {
    const { currentUser } = useAuth();
    const { vendorOrders, updateOrderStatus } = useOrders();

    const handleMarkReturned = (orderId) => {
        updateOrderStatus(orderId, 'Returned');
        toast.success('Inventory Restored');
    };

    const statusGroups = {
        Overdue: vendorOrders.filter(o => o.status === 'Overdue'),
        'Pending Return': vendorOrders.filter(o => o.status === 'Pending Return'),
        Active: vendorOrders.filter(o => o.status === 'Active'),
        Returned: vendorOrders.filter(o => o.status === 'Returned'),
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight-deep to-midnight p-6 text-white space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 animate-luxury-entry stagger-1">
                <div className="space-y-2">
                    <h1 className="font-playfair text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tighter">Yield Contracts</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Active Rental Portfolio</p>
                    </div>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <SummaryCard index={0} label="Overdue" count={statusGroups.Overdue.length} />
                <SummaryCard index={1} label="Returns Pending" count={statusGroups['Pending Return'].length} />
                <SummaryCard index={2} label="Live Contracts" count={statusGroups.Active.length} />
                <SummaryCard index={3} label="Restored" count={statusGroups.Returned.length} />
            </div>

            {vendorOrders.length === 0 ? (
                <div className="bg-midnight/40 backdrop-blur-3xl border border-dashed border-white/10 rounded-[3rem] p-24 text-center animate-luxury-entry stagger-5">
                    <ClipboardList size={80} strokeWidth={0.5} className="text-gray-700 mx-auto mb-8 animate-float" />
                    <h3 className="font-playfair text-3xl font-black text-gray-500 mb-2 tracking-tight">The Ledger is Empty</h3>
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">Awaiting new acquisitions...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {['Overdue', 'Pending Return', 'Active', 'Returned'].map((status, sIndex) => {
                        const orders = statusGroups[status];
                        if (!orders.length) return null;
                        return (
                            <div key={status} className={`animate-luxury-entry stagger-${sIndex + 6}`}>
                                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                    {status === 'Overdue' ? <AlertTriangle size={14} className="text-red-500" /> : <Clock size={14} className="text-gold" />}
                                    {status} <span className="text-white/20">/</span> {orders.length} Contracts
                                </h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {orders.map(order => {
                                        const myItems = order.items?.filter(i => i.vendorId === currentUser?.id) || [];
                                        const myRevenue = myItems.reduce((s, i) => s + (i.subtotal || 0), 0);
                                        return (
                                            <div key={order.orderId} className="bg-midnight/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 group hover:border-gold/30 transition-all duration-700 shadow-2xl relative overflow-hidden">
                                                {/* Header Info */}
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-black text-gold uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full border border-gold/20">#{order.orderId.slice(-8).toUpperCase()}</span>
                                                        <div className="flex items-center gap-2 mt-4">
                                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 group-hover:border-gold/30 transition-all">
                                                                <User size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-white uppercase tracking-wider">{order.customerName}</p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Client Hub</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-white tracking-tighter">{formatCurrency(myRevenue)}</p>
                                                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-1">Contract Value</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
                                                    <Clock size={14} className="text-gray-500" />
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {formatDate(order.rentalStartDate)} <span className="text-white/20 mx-2">→</span> {formatDate(order.rentalEndDate)}
                                                    </p>
                                                </div>

                                                {/* Items */}
                                                <div className="space-y-4 border-t border-white/5 pt-6">
                                                    {myItems.map((item, i) => (
                                                        <div key={i} className="flex justify-between items-center group/item">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 group-hover/item:border-gold/30 transition-all">
                                                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-white uppercase tracking-wider">{item.productName}</p>
                                                                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Size {item.size} <span className="mx-1 text-white/10">|</span> Qty {item.quantity}</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-black text-gold">{formatCurrency(item.subtotal)}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Action */}
                                                {order.status !== 'Returned' && (
                                                    <button
                                                        onClick={() => handleMarkReturned(order.orderId)}
                                                        className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gold hover:bg-gold hover:text-midnight hover:shadow-glow transition-all flex items-center justify-center gap-3"
                                                    >
                                                        <ShieldCheck size={16} /> Finalize Return & Restore Stock
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
