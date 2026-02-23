import React, { useState, useMemo } from 'react';
import {
    ShoppingCart, Trash2, ShoppingBag, Store, ChevronDown,
    ChevronUp, Edit3, Check, X, Tag, Shield, Truck, RotateCcw,
    CreditCard, Info, AlertCircle, Package, Clock, Gift, ArrowRight
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { useToast } from '../../context/ToastContext';
import { useUsers } from '../../context/UserContext';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import Loader from '../Shared/Loader';
import { formatCurrency, formatDate, getTodayString, calculateRentalDays, DEFAULT_IMAGE } from '../../utils/helpers';

// ─── Inline Date Editor ────────────────────────────────────────────────────────
function DateEditor({ item, onSave, onCancel }) {
    const today = getTodayString();
    const [start, setStart] = useState(item.rentalStartDate);
    const [end, setEnd] = useState(item.rentalEndDate);
    const days = calculateRentalDays(start, end);
    const valid = days > 0;

    return (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-blue-700 mb-2">Edit Rental Dates</p>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                    <input type="date" value={start} min={today}
                        onChange={e => setStart(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">End Date</label>
                    <input type="date" value={end} min={start || today}
                        onChange={e => setEnd(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
            </div>
            {valid && <p className="text-xs text-blue-600 font-medium">{days} day(s) · {formatCurrency(item.pricePerDay * days * item.quantity)} rental fee</p>}
            {!valid && end && <p className="text-xs text-red-500">End date must be after start date</p>}
            <div className="flex gap-2 pt-1">
                <button onClick={() => valid && onSave(start, end)}
                    disabled={!valid}
                    className="flex items-center gap-1 px-3 py-1.5 bg-midnight text-white text-xs rounded-lg disabled:opacity-50 hover:bg-blue-900 transition-colors">
                    <Check size={12} /> Save
                </button>
                <button onClick={onCancel}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors">
                    <X size={12} /> Cancel
                </button>
            </div>
        </div>
    );
}

// ─── Inline Size Editor ─────────────────────────────────────────────────────────
function SizeEditor({ item, availableSizes, onSave, onCancel }) {
    const [selected, setSelected] = useState(item.size);
    return (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs font-semibold text-amber-700 mb-2">Select Size</p>
            <div className="flex flex-wrap gap-2 mb-3">
                {availableSizes.map(s => (
                    <button key={s} onClick={() => setSelected(s)}
                        className={`px-3 py-1 rounded-lg text-xs border transition-all font-medium ${selected === s ? 'bg-midnight text-white border-midnight' : 'border-gray-300 text-gray-600 hover:border-midnight'}`}>
                        {s}
                    </button>
                ))}
            </div>
            <div className="flex gap-2">
                <button onClick={() => onSave(selected)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-midnight text-white text-xs rounded-lg hover:bg-blue-900 transition-colors">
                    <Check size={12} /> Save
                </button>
                <button onClick={onCancel}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors">
                    <X size={12} /> Cancel
                </button>
            </div>
        </div>
    );
}

// ─── Cart Item Card ─────────────────────────────────────────────────────────────
function CartItemCard({ item, allProducts, onProductClick }) {
    const { removeFromCart, updateQuantity, updateDates, updateSize } = useCart();
    const toast = useToast();
    const [editingDates, setEditingDates] = useState(false);
    const [editingSize, setEditingSize] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const product = allProducts.find(p => p.id === item.productId);
    // Use the global product state for live stock updates
    const availableQty = product?.availableQuantity ?? 10;
    const maxQty = availableQty;

    const handleSaveDates = (start, end) => {
        updateDates(item.id, start, end);
        setEditingDates(false);
        toast.success('Rental dates updated');
    };

    const handleSaveSize = (size) => {
        updateSize(item.id, size);
        setEditingSize(false);
        toast.success('Size updated');
    };

    const handleQtyChange = (delta) => {
        const newQty = item.quantity + delta;
        if (newQty < 1 || newQty > maxQty) return;
        updateQuantity(item.id, newQty);
    };

    return (
        <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-2xl hover:border-gold/30 transition-all duration-700 overflow-hidden group">
            <div className="p-4">
                <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-gray-100 border border-gray-100" onClick={() => onProductClick && onProductClick(product || { id: item.productId })}>
                        <img
                            src={item.productImage || (product?.images && Array.isArray(product.images) ? product.images[0] : null) || DEFAULT_IMAGE}
                            alt={item.productName}
                            className="w-24 h-24 sm:w-28 sm:h-28 object-cover hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                            onError={e => { e.target.src = DEFAULT_IMAGE; }}
                        />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                            <div className="min-w-0 flex-1 cursor-pointer group/title" onClick={() => onProductClick && onProductClick(product || { id: item.productId })}>
                                <h3 className="font-playfair text-lg font-black text-midnight leading-tight truncate group-hover/title:text-gold transition-colors duration-500">{item.productName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Store size={10} className="text-gold" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">{item.vendorShopName}</span>
                                </div>
                            </div>
                            <button onClick={() => removeFromCart(item.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-red-50"
                                aria-label="Remove item">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Tags row */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="badge bg-gray-100 text-gray-600">{item.category}</span>
                            {/* Size badge - clickable to edit */}
                            <button onClick={() => { setEditingSize(!editingSize); setEditingDates(false); }}
                                className={`badge flex items-center gap-1 transition-all ${editingSize ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-400' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                                Size: {item.size} <Edit3 size={9} />
                            </button>
                        </div>

                        {/* Dates row - clickable to edit */}
                        <button onClick={() => { setEditingDates(!editingDates); setEditingSize(false); }}
                            className={`mt-2 flex items-center gap-1.5 text-xs transition-all rounded-lg px-2 py-1 -ml-2 ${editingDates ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                            <Clock size={11} />
                            {formatDate(item.rentalStartDate)} → {formatDate(item.rentalEndDate)}
                            <span className="font-medium">({item.rentalDays}d)</span>
                            <Edit3 size={9} className="ml-0.5" />
                        </button>

                        {/* Quantity + Price */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleQtyChange(-1)}
                                    disabled={item.quantity <= 1}
                                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors font-bold text-lg leading-none">−</button>
                                <span className="w-8 text-center font-semibold text-midnight text-sm transition-colors">{item.quantity}</span>
                                <button onClick={() => handleQtyChange(1)}
                                    disabled={item.quantity >= maxQty}
                                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors font-bold text-lg leading-none">+</button>
                                {maxQty <= 5 && maxQty > 0 && (
                                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                                        <AlertCircle size={10} /> Live: Only {maxQty} left
                                    </span>
                                )}
                                {maxQty === 0 && (
                                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                        <X size={10} /> Out of Stock
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-midnight text-base transition-colors">{formatCurrency(item.subtotal + item.depositTotal)}</p>
                                <p className="text-xs text-gray-400">{formatCurrency(item.pricePerDay)}/day</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inline editors */}
                {editingDates && (
                    <DateEditor item={item} onSave={handleSaveDates} onCancel={() => setEditingDates(false)} />
                )}
                {editingSize && product && (
                    <SizeEditor item={item} availableSizes={product.sizes || []} onSave={handleSaveSize} onCancel={() => setEditingSize(false)} />
                )}

                {/* Expandable price breakdown */}
                <button onClick={() => setExpanded(v => !v)}
                    className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    Price breakdown
                </button>
                {expanded && (
                    <div className="mt-2 bg-gray-50 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex justify-between text-gray-600">
                            <span>{formatCurrency(item.pricePerDay)} × {item.rentalDays} days × {item.quantity}</span>
                            <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Security deposit × {item.quantity}</span>
                            <span className="font-medium">{formatCurrency(item.depositTotal)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-midnight border-t border-gray-200 pt-1.5 transition-colors">
                            <span>Item Total</span>
                            <span>{formatCurrency(item.subtotal + item.depositTotal)}</span>
                        </div>
                        <p className="text-gray-400 text-xs pt-0.5">Deposit refundable upon return in good condition</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Checkout Modal ─────────────────────────────────────────────────────────────
function CheckoutModal({ isOpen, onClose, onConfirm, loading }) {
    const { cartItems, totalRentalFees, totalDeposits, grandTotal, groupCartByVendor } = useCart();
    const vendorGroups = groupCartByVendor();
    const [payMethod, setPayMethod] = useState('card');

    const PAY_METHODS = [
        { id: 'card', label: 'Priority Credit/Debit', icon: CreditCard, sub: 'Instant authorization' },
        { id: 'upi', label: 'UPI / Digital Link', icon: Shield, sub: 'Seamless transfer' },
        { id: 'cod', label: 'Cash Collection', icon: Package, sub: 'Verified on delivery' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Review & Confirm Order" size="lg">
            <div className="space-y-5">
                {/* Order summary by vendor */}
                <div className="space-y-3">
                    {Object.entries(vendorGroups).map(([vendorId, { shopName, items }]) => (
                        <div key={vendorId} className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="px-4 py-2.5 bg-gray-50 flex items-center gap-2 transition-colors">
                                <Store size={13} className="text-gold" />
                                <span className="font-semibold text-midnight text-sm transition-colors">{shopName}</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-3 p-3">
                                        <img src={item.productImage} alt={item.productName}
                                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                                            onError={e => { e.target.src = DEFAULT_IMAGE; }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-midnight text-sm truncate transition-colors">{item.productName}</p>
                                            <p className="text-gray-400 text-xs">Size: {item.size} · {item.quantity}× · {item.rentalDays}d</p>
                                            <p className="text-xs text-gray-500">{formatDate(item.rentalStartDate)} → {formatDate(item.rentalEndDate)}</p>
                                        </div>
                                        <span className="font-semibold text-midnight text-sm transition-colors">{formatCurrency(item.subtotal + item.depositTotal)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment method */}
                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Select Payment Protocol</p>
                    <div className="grid grid-cols-1 gap-2">
                        {PAY_METHODS.map(m => (
                            <button key={m.id} onClick={() => setPayMethod(m.id)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${payMethod === m.id ? 'border-midnight bg-midnight text-white shadow-xl translate-x-1' : 'border-gray-100 bg-gray-50/50 text-gray-400 hover:border-midnight/20'}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payMethod === m.id ? 'bg-white/10 text-gold' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                    <m.icon size={20} strokeWidth={1.5} />
                                </div>
                                <div className="text-left flex-1">
                                    <p className={`text-sm font-bold ${payMethod === m.id ? 'text-white' : 'text-midnight'}`}>{m.label}</p>
                                    <p className={`text-[10px] uppercase tracking-widest ${payMethod === m.id ? 'text-blue-300' : 'text-gray-400'}`}>{m.sub}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payMethod === m.id ? 'border-gold bg-gold' : 'border-gray-200'}`}>
                                    {payMethod === m.id && <Check size={12} className="text-midnight font-bold" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price summary */}
                <div className="bg-white border-2 border-midnight rounded-[2rem] p-6 space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span>Service Valuation</span><span>{formatCurrency(totalRentalFees)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span>Assurance Deposits</span><span>{formatCurrency(totalDeposits)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-emerald-600 uppercase tracking-widest">
                            <span>Global Logistics</span><span>COMPLIMENTARY</span>
                        </div>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="flex justify-between items-center pt-1">
                        <span className="font-luxury text-xl text-midnight">Amount Payable</span>
                        <span className="text-2xl font-bold text-midnight tracking-tighter">{formatCurrency(grandTotal)}</span>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                        { icon: Shield, text: 'Secure Payment' },
                        { icon: Truck, text: 'Free Delivery' },
                        { icon: RotateCcw, text: 'Easy Returns' },
                    ].map(b => (
                        <div key={b.text} className="flex flex-col items-center gap-1 text-xs text-gray-500">
                            <b.icon size={16} className="text-gold" />
                            {b.text}
                        </div>
                    ))}
                </div>

                <p className="text-xs text-gray-400 text-center">
                    By confirming, you agree to our rental terms. Deposits are refunded within 3–5 business days after return.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={onClose}
                        className="h-14 rounded-2xl border border-gray-100 font-bold text-[13px] uppercase tracking-widest hover:bg-gray-50 transition-all">
                        Review Assets
                    </button>
                    <button onClick={() => onConfirm(payMethod)}
                        className="h-14 rounded-2xl bg-midnight text-white font-bold text-[13px] uppercase tracking-widest hover:bg-blue-900 shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        {loading ? 'Processing...' : `Confirm & Acquire`}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ─── Main CartPage ──────────────────────────────────────────────────────────────
export default function CartPage({ onNavigate, onProductClick }) {
    const {
        cartItems, removeFromCart, clearCart, cartCount,
        totalRentalFees, totalDeposits, grandTotal,
        groupCartByVendor, loading: cartLoading
    } = useCart();
    const { userOrders, loading: ordersLoading } = useOrders();
    const { allProducts, updateAvailability } = useProducts();
    const toast = useToast();
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [coupon, setCoupon] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);

    const vendorGroups = groupCartByVendor();
    const vendorCount = Object.keys(vendorGroups).length;

    const handleApplyCoupon = () => {
        if (coupon.trim().toUpperCase() === 'ELITE10') {
            setCouponApplied(true);
            toast.success('ELITE10 Authorization Granted — 10% Yield applied');
        } else {
            toast.error('Invalid Protocol Code');
        }
    };

    const discount = couponApplied ? totalRentalFees * 0.1 : 0;
    const finalTotal = grandTotal - discount;

    const handleCheckout = async (payMethod) => {
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 900));
            Object.entries(vendorGroups).forEach(([vendorId, { shopName, items }]) => {
                placeOrder({
                    items,
                    vendorId,
                    shopName,
                    rentalStartDate: items[0]?.rentalStartDate,
                    rentalEndDate: items[0]?.rentalEndDate,
                    totalAmount: items.reduce((s, i) => s + i.subtotal + i.depositTotal, 0),
                    paymentMethod: payMethod,
                });
                items.forEach(item => updateAvailability(item.productId, -item.quantity));
            });
            clearCart();
            setCheckoutOpen(false);
            toast.success('Order placed successfully! 🎉 Check My Rentals for details.');
            onNavigate('rentals');
        } catch {
            toast.error('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isLoading = cartLoading || ordersLoading;

    if (isLoading && cartItems.length === 0) {
        return <Loader message="Accessing Manifest..." />
    }

    if (cartItems.length === 0) {
        return (
            <div className="space-y-12">
                <div className="space-y-6">
                    <h1 className="font-serif text-5xl font-medium text-midnight tracking-tight">Accessing Manifest</h1>
                    <div className="bg-white rounded-3xl shadow-luxury p-16 text-center border border-gray-100">
                        <div className="w-24 h-24 bg-midnight/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart size={40} className="text-gray-300" />
                        </div>
                        <h3 className="font-serif text-2xl font-medium text-gray-500 mb-2">Manifest is currently empty</h3>
                        <p className="text-gray-400 text-sm mb-8">Initiate an acquisition to begin your curation.</p>
                        <Button onClick={() => onNavigate('catalog')}>
                            <ShoppingBag size={16} className="mr-2" /> Begin Search
                        </Button>
                    </div>
                </div>

            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="font-serif text-5xl font-medium text-midnight tracking-tight leading-none mb-3">Acquisition Manifest</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-[#8B7355] uppercase tracking-[0.4em] bg-[#FDFCF0] px-3 py-1 rounded-full border border-[#F5F1DA]">
                            {cartCount} Asset{cartCount > 1 ? 's' : ''} Locked
                        </span>
                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{vendorCount} Curators Involved</span>
                    </div>
                </div>
                <button onClick={clearCart}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 uppercase tracking-widest">
                    <Trash2 size={12} className="group-hover:rotate-12 transition-transform" /> Dissolve Manifest
                </button>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-4 bg-midnight/5 border border-midnight/5 rounded-2xl p-4 mb-8">
                <div className="w-8 h-8 rounded-xl bg-midnight text-gold flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                    <Info size={16} />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-midnight">Curator Instructions</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Adjust <strong>Size</strong> or <strong>Rental Dates</strong> directly on the items below. Use code <span className="text-gold font-bold">STYLE10</span> for exclusive valuation yields.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="xl:col-span-2 space-y-4">
                    {Object.entries(vendorGroups).map(([vendorId, { shopName, items }]) => (
                        <div key={vendorId}>
                            {/* Vendor header */}
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <div className="w-7 h-7 bg-midnight rounded-lg flex items-center justify-center">
                                    <Store size={13} className="text-gold" />
                                </div>
                                <span className="font-semibold text-midnight">{shopName}</span>
                                <span className="text-gray-400 text-sm">({items.length} item{items.length > 1 ? 's' : ''})</span>
                            </div>
                            <div className="space-y-3">
                                {items.map(item => (
                                    <CartItemCard key={item.id} item={item} allProducts={allProducts} onProductClick={onProductClick} />
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Coupon */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag size={15} className="text-gold" />
                            <span className="font-semibold text-midnight text-sm">Apply Coupon</span>
                        </div>
                        <div className="flex gap-2">
                            <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                                placeholder="Enter coupon code (try STYLE10)"
                                disabled={couponApplied}
                                className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold disabled:bg-gray-50 disabled:text-gray-400" />
                            {couponApplied ? (
                                <button onClick={() => { setCouponApplied(false); setCoupon(''); }}
                                    className="px-4 py-2.5 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1">
                                    <X size={13} /> Remove
                                </button>
                            ) : (
                                <button onClick={handleApplyCoupon}
                                    className="px-4 py-2.5 bg-midnight text-white text-sm font-medium rounded-xl hover:bg-blue-900 transition-colors">
                                    Apply
                                </button>
                            )}
                        </div>
                        {couponApplied && (
                            <div className="mt-2 flex items-center gap-1.5 text-green-600 text-xs font-medium">
                                <Check size={12} /> STYLE10 applied — saving {formatCurrency(discount)} on rental fees!
                            </div>
                        )}
                    </div>

                    {/* Delivery info */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {[
                                { icon: Truck, title: 'Free Delivery', sub: 'On all orders' },
                                { icon: Shield, title: 'Secure Payment', sub: 'SSL encrypted' },
                                { icon: RotateCcw, title: 'Easy Returns', sub: 'Doorstep pickup' },
                            ].map(f => (
                                <div key={f.title} className="flex flex-col items-center gap-1.5">
                                    <div className="w-9 h-9 bg-gold/10 rounded-xl flex items-center justify-center">
                                        <f.icon size={16} className="text-gold" />
                                    </div>
                                    <p className="font-semibold text-midnight text-xs">{f.title}</p>
                                    <p className="text-gray-400 text-xs">{f.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="xl:col-span-1">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-luxury border border-white/50 overflow-hidden sticky top-24">
                        <div className="p-8 space-y-6">
                            <div className="space-y-1">
                                <h2 className="font-serif text-2xl font-medium text-midnight tracking-tight">Summary</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Final Valuation</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Rental Fees</span>
                                    <span className="font-medium text-midnight">{formatCurrency(totalRentalFees)}</span>
                                </div>
                                {couponApplied && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B7355] font-bold uppercase tracking-widest text-[10px]">Valuation Yield</span>
                                        <span className="font-bold text-emerald-600">−{formatCurrency(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Security Deposits</span>
                                    <span className="font-medium text-midnight">{formatCurrency(totalDeposits)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Logistics</span>
                                    <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">Complimentary</span>
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent my-2" />

                                <div className="flex justify-between items-end">
                                    <span className="font-serif text-lg text-midnight">Total</span>
                                    <span className="text-3xl font-semibold text-midnight tracking-tighter">
                                        {formatCurrency(finalTotal)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setCheckoutOpen(true)}
                                className="w-full h-14 bg-midnight text-white rounded-2xl font-bold text-[15px] hover:bg-blue-900 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-3 group"
                            >
                                Proceed to Checkout
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button onClick={() => onNavigate('catalog')}
                                className="w-full text-center text-[11px] font-bold text-[#8B7355] hover:text-midnight uppercase tracking-widest transition-colors py-2">
                                Continue Exploration
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrated Order Manifest (History) */}
            {userOrders.length > 0 && (
                <div className="mt-20 space-y-8 animate-fade-in-up">
                    <div className="flex items-end justify-between border-b border-gray-100 pb-6">
                        <div>
                            <h2 className="font-serif text-4xl font-medium text-midnight tracking-tight mb-2">Acquisition Audit</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Historical Manifest Records</p>
                        </div>
                        <button onClick={() => onNavigate('rentals')}
                            className="group flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold text-midnight bg-midnight/5 hover:bg-midnight hover:text-white transition-all duration-500 uppercase tracking-widest border border-midnight/5">
                            View Full Archive <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userOrders.slice(0, 3).map(order => (
                            <RecentAuditCard key={order.id} order={order} />
                        ))}
                    </div>
                </div>
            )}

            {/* Models */}
            {checkoutOpen && (
                <CheckoutModal
                    isOpen={checkoutOpen}
                    onClose={() => setCheckoutOpen(false)}
                    totalAmount={finalTotal}
                    cartItems={cartItems}
                    onConfirm={handleCheckout}
                    vendorGroups={vendorGroups}
                />
            )}
            {loading && <Loader fullPage={true} message="Processing your order..." />}
        </div>
    );
}

// ─── Recent Audit Card ──────────────────────────────────────────────────────────
function RecentAuditCard({ order }) {
    return (
        <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-500 group cursor-default">
            <div className="flex gap-4 items-center">
                <div className="flex -space-x-4">
                    {order.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-2xl border-2 border-white overflow-hidden shadow-lg transform group-hover:-translate-y-1 transition-transform" style={{ zIndex: 5 - idx }}>
                            <img
                                src={item.productImage || DEFAULT_IMAGE}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={e => { e.target.src = DEFAULT_IMAGE; }}
                            />
                        </div>
                    ))}
                    {order.items?.length > 2 && (
                        <div className="w-16 h-16 rounded-2xl border-2 border-white bg-midnight text-gold flex items-center justify-center text-xs font-bold shadow-lg z-0">
                            +{order.items.length - 2}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${order.status === 'Active' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{order.status}</span>
                    </div>
                    <h4 className="font-serif text-lg font-medium text-midnight truncate tracking-tight group-hover:text-gold transition-colors">{order.items?.[0]?.productName || 'Order'}</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{formatDate(order.orderDate)} · {formatCurrency(order.totalAmount)}</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-gold group-hover:translate-x-1 transition-all" />
            </div>
        </div>
    );
}
