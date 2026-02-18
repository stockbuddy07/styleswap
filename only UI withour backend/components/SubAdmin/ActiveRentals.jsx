import React, { useMemo } from 'react';
import { ClipboardList, AlertTriangle } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import Button from '../Shared/Button';
import { useToast } from '../../context/ToastContext';

export default function ActiveRentals() {
    const { currentUser } = useAuth();
    const { allOrders, updateOrderStatus } = useOrders();
    const toast = useToast();

    const vendorOrders = useMemo(() =>
        allOrders.filter(o => o.items?.some(i => i.vendorId === currentUser?.id)),
        [allOrders, currentUser]
    );

    const handleMarkReturned = (orderId) => {
        updateOrderStatus(orderId, 'Returned');
        toast.success('Order marked as returned');
    };

    const statusGroups = {
        Overdue: vendorOrders.filter(o => o.status === 'Overdue'),
        'Pending Return': vendorOrders.filter(o => o.status === 'Pending Return'),
        Active: vendorOrders.filter(o => o.status === 'Active'),
        Returned: vendorOrders.filter(o => o.status === 'Returned'),
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-playfair text-2xl font-bold text-midnight">Active Rentals</h1>
                <p className="text-gray-500 text-sm mt-1">Manage customer rentals for your shop</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(statusGroups).map(([status, orders]) => (
                    <div key={status} className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
                        <p className="text-2xl font-bold text-midnight">{orders.length}</p>
                        <span className={`badge mt-1 ${getStatusColor(status)}`}>{status}</span>
                    </div>
                ))}
            </div>

            {vendorOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-16 text-center">
                    <ClipboardList size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="font-playfair text-xl font-semibold text-gray-500">No rentals yet</h3>
                    <p className="text-gray-400 text-sm mt-2">Customer orders will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {['Overdue', 'Pending Return', 'Active', 'Returned'].map(status => {
                        const orders = statusGroups[status];
                        if (!orders.length) return null;
                        return (
                            <div key={status}>
                                <h2 className="font-semibold text-midnight mb-3 flex items-center gap-2">
                                    {status === 'Overdue' && <AlertTriangle size={16} className="text-red-500" />}
                                    {status} <span className="text-gray-400 font-normal text-sm">({orders.length})</span>
                                </h2>
                                <div className="space-y-3">
                                    {orders.map(order => {
                                        const myItems = order.items?.filter(i => i.vendorId === currentUser?.id) || [];
                                        const myRevenue = myItems.reduce((s, i) => s + (i.subtotal || 0), 0);
                                        return (
                                            <div key={order.orderId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-midnight text-sm">#{order.orderId.slice(-8).toUpperCase()}</span>
                                                            <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
                                                        </div>
                                                        <p className="text-gray-600 text-sm">Customer: <strong>{order.customerName}</strong></p>
                                                        <p className="text-gray-500 text-xs mt-0.5">
                                                            {formatDate(order.rentalStartDate)} → {formatDate(order.rentalEndDate)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-midnight">{formatCurrency(myRevenue)}</span>
                                                        {order.status !== 'Returned' && (
                                                            <Button size="sm" variant="outline" onClick={() => handleMarkReturned(order.orderId)}>
                                                                Mark Returned
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Items from this vendor */}
                                                <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
                                                    {myItems.map((item, i) => (
                                                        <div key={i} className="flex justify-between text-xs text-gray-500">
                                                            <span>{item.productName} × {item.quantity} ({item.size})</span>
                                                            <span>{formatCurrency(item.subtotal)}</span>
                                                        </div>
                                                    ))}
                                                </div>
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
