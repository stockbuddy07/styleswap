import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, CreditCard, Shield, Truck, RotateCcw, Calendar, Tag, Gift, ArrowRight, Crown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { DEFAULT_IMAGE } from '../../utils/helpers';
import Button from '../Shared/Button';
import Loader from '../Shared/Loader';
import Modal from '../Shared/Modal';

export default function PaymentConfirmationPage({ onNavigate, onBack }) {
    const { checkoutTemp, clearCheckoutTemp, cartItems, groupCartByVendor, totalRentalFees, totalDeposits, grandTotal, clearCart } = useCart();
    const { placeOrder } = useOrders();
    const toast = useToast();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [processing, setProcessing] = useState(false);

    const vendorGroups = groupCartByVendor();
    const payMethod = checkoutTemp?.payMethod || 'card';
    const cardDetails = checkoutTemp?.cardDetails;
    const discount = checkoutTemp?.discount || 0;
    const finalTotal = grandTotal - discount;

    const topics = [
        { id: 'wedding', label: 'Wedding', icon: Crown, color: 'rose' },
        { id: 'casual', label: 'Casual', icon: Tag, color: 'blue' },
        { id: 'office', label: 'Office Wear', icon: Calendar, color: 'emerald' },
        { id: 'party', label: 'Party', icon: Gift, color: 'purple' },
        { id: 'vacation', label: 'Vacation', icon: RotateCcw, color: 'amber' }
    ];

    const handleTopicToggle = (topicId) => {
        setSelectedTopics(prev => 
            prev.includes(topicId) ? prev.filter(t => t !== topicId) : [...prev, topicId]
        );
    };

    const handleConfirm = async () => {
        if (selectedTopics.length === 0) {
            toast.error('Please select at least one styling topic');
            return;
        }
        setProcessing(true);
        setLoading(true);
        try {
            // Simulate processing
            await new Promise(r => setTimeout(r, 1500));
            
            // Place orders by vendor
            Object.entries(vendorGroups).forEach(([vendorId, group]) => {
                placeOrder({
                    items: group.items,
                    vendorId,
                    shopName: group.shopName,
                    rentalStartDate: group.items[0].rentalStartDate,
                    rentalEndDate: group.items[0].rentalEndDate,
                    totalAmount: finalTotal,
                    paymentMethod: payMethod,
                    selectedTopics, // Pass topics for styling recommendations
                });
            });
            
            clearCart();
            clearCheckoutTemp();
            toast.success(`Order confirmed! Style topics: ${selectedTopics.map(t => topics.find(top => top.id === t)?.label).join(', ')} 🎉`);
            onNavigate('rentals');
        } catch (err) {
            toast.error('Order processing failed. Please try again.');
        } finally {
            setLoading(false);
            setProcessing(false);
        }
    };

    const PAYMENT_DETAILS = {
        card: { title: 'Priority Credit/Debit', status: '✅ Authorized' },
        upi: { title: 'UPI / Digital Link', status: '✅ Instant Transfer' },
        cod: { title: 'Cash Collection', status: '📦 On Delivery' }
    };

    if (loading) {
        return <Loader fullPage={true} message="Processing your luxury acquisition..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack || (() => onNavigate('cart'))}
                        className="p-2 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/50 hover:bg-white hover:shadow-xl transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-serif text-5xl font-medium text-midnight tracking-tight">Payment Confirmation</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Review your styling selections</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div className="space-y-6">
                        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-2xl p-8">
                            <h3 className="font-serif text-2xl font-bold text-midnight mb-6 flex items-center gap-3">
                                <CheckCircle className="text-emerald-500" size={28} /> Order Summary
                            </h3>
                            
                            {/* Vendor Groups */}
                            <div className="space-y-4 mb-8">
                                {Object.entries(vendorGroups).map(([vendorId, group]) => (
                                    <div key={vendorId} className="border border-gray-100 rounded-2xl p-5 overflow-hidden">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-midnight rounded-2xl flex items-center justify-center">
                                                <Truck size={16} className="text-gold" />
                                            </div>
                                            <span className="font-bold text-lg text-midnight">{group.shopName}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {group.items.slice(0, 3).map(item => (
                                                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                                                    <img 
                                                        src={item.productImage || DEFAULT_IMAGE} 
                                                        alt={item.productName}
                                                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-midnight truncate">{item.productName}</p>
                                                        <p className="text-xs text-gray-500">Size: {item.size} · {item.quantity}x · {item.rentalDays}d</p>
                                                    </div>
                                                    <span className="font-bold text-midnight text-sm">{formatCurrency(item.subtotal + item.depositTotal)}</span>
                                                </div>
                                            ))}
                                            {group.items.length > 3 && (
                                                <p className="text-xs text-gray-500 text-center pt-2">+{group.items.length - 3} more items</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Payment Method */}
                            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100 rounded-2xl p-6">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-midnight">
                                    <CreditCard size={20} className="text-emerald-600" />
                                    {payMethod === 'card' && cardDetails ? `${cardDetails.type === 'debit' ? 'Debit' : 'Credit'} ${cardDetails.brand} ${cardDetails.maskedNumber}` : PAYMENT_DETAILS[payMethod]?.title || 'Payment Method'}
                                </h4>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-emerald-700 font-semibold flex items-center gap-2">
                                        {payMethod === 'card' && cardDetails ? '✅ Card Authorized' : PAYMENT_DETAILS[payMethod]?.status || 'Processing'}
                                        <CheckCircle className="w-4 h-4" />
                                    </p>
                                    {payMethod === 'card' && cardDetails && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            Expires {cardDetails.expiry} <Shield className="w-3 h-3 text-emerald-500" />
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Styling Topics & Totals */}
                    <div className="space-y-6">
                        {/* Topics Selection */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-2xl p-8">
                            <h3 className="font-serif text-2xl font-bold text-midnight mb-6 flex items-center gap-3">
                                Styling Topics <span className="text-gold text-lg">(Select for Tips)</span>
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {topics.map(topic => {
                                    const isSelected = selectedTopics.includes(topic.id);
                                    const Icon = topic.icon;
                                    return (
                                        <button
                                            key={topic.id}
                                            onClick={() => handleTopicToggle(topic.id)}
                                            className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 h-full flex flex-col items-center gap-3 text-center ${
                                                isSelected 
                                                    ? 'border-midnight bg-gradient-to-br from-midnight to-blue-900 text-white shadow-2xl shadow-blue-500/25' 
                                                    : 'border-gray-200 bg-white/50 hover:border-gold/50 hover:shadow-xl'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <Icon size={20} className={`text-${topic.color}-400 ${isSelected ? 'text-white' : ''}`} />
                                            </div>
                                            <span className="font-bold text-sm leading-tight">{topic.label}</span>
                                            <div className={`w-3 h-3 rounded-full transition-all ${isSelected ? 'bg-white scale-110' : 'bg-transparent border-2 border-gray-300 group-hover:border-gold/50'}`} />
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedTopics.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        Selected: {selectedTopics.map(id => topics.find(t => t.id === id)?.label).join(', ')}
                                    </p>
                                    <p className="text-sm text-gray-600 italic">Personalized styling recommendations will be sent post-confirmation</p>
                                </div>
                            )}
                        </div>

                        {/* Price Summary */}
                        <div className="bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-2xl p-8 sticky top-8">
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    Rental Fees <span>{formatCurrency(totalRentalFees)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm font-bold text-emerald-600">
                                        Style Elite Discount <span>-{formatCurrency(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    Security Deposits <span>{formatCurrency(totalDeposits)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-emerald-600 uppercase tracking-widest">
                                    Luxury Logistics <span>FREE</span>
                                </div>
                                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />
                                <div className="flex justify-between items-center">
                                    <span className="font-serif text-xl font-bold text-midnight">Total Payable</span>
                                    <span className="text-3xl font-black text-midnight tracking-tight">{formatCurrency(finalTotal)}</span>
                                </div>
                            </div>
                            
                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
                                {[
                                    { icon: Shield, label: 'Secure' },
                                    { icon: Truck, label: 'Express Delivery' },
                                    { icon: RotateCcw, label: 'Hassle-free Returns' }
                                ].map((badge, i) => {
                                    const Icon = badge.icon;
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-1.5 text-xs text-gray-500 group hover:text-gold transition-colors">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gold/20 to-amber-100 rounded-2xl flex items-center justify-center group-hover:from-gold/40 group-hover:to-gold/20 transition-all">
                                                <Icon size={16} />
                                            </div>
                                            {badge.label}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/50 shadow-xl flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={onBack || (() => onNavigate('cart'))}
                        className="flex-1 h-16 rounded-2xl font-bold text-lg bg-white border-2 border-gray-200 hover:border-gold hover:bg-gold/10 hover:shadow-xl transition-all px-8 uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        <ArrowLeft size={20} /> Edit Selection
                    </button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedTopics.length === 0 || processing}
                        className="flex-1 h-16 !rounded-2xl !font-black !text-lg shadow-2xl hover:shadow-glow flex items-center justify-center gap-3 uppercase tracking-[0.1em] !bg-gradient-to-r !from-midnight !to-blue-900 hover:from-blue-900 hover:to-midnight"
                    >
                        {processing ? (
                            <>
                                <Loader size="small" color="white" /> Processing...
                            </>
                        ) : (
                            <>
                                Confirm & Acquire <ArrowRight size={20} />
                            </>
                        )}
                    </Button>
                </div>

                <div className="text-center text-xs text-gray-400 pt-8 border-t border-gray-200">
                    By confirming, you agree to StyleSwap luxury rental terms. 
                    Deposits refunded 3-5 days post-return inspection.
                </div>
            </div>
        </div>
    );
}

