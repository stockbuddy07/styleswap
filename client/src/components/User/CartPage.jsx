import React, { useState, useMemo } from 'react';
import {
    ShoppingCart, Trash2, ShoppingBag, Store, ChevronDown,
    ChevronUp, Edit3, Check, X, Tag, Shield, Truck, RotateCcw,
    CreditCard, Info, AlertCircle, Package, Clock, Gift
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
function CartItemCard({ item, allProducts }) {
    const { removeFromCart, updateQuantity, updateDates, updateSize } = useCart();
    const toast = useToast();
    const [editingDates, setEditingDates] = useState(false);
    const [editingSize, setEditingSize] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const product = allProducts.find(p => p.id === item.productId);
    const maxQty = product?.availableQuantity || 10;

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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-4">
                <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative flex-shrink-0">
                        <img src={item.productImage} alt={item.productName}
                            className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl"
                            onError={e => { e.target.src = DEFAULT_IMAGE; }} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="font-semibold text-midnight text-sm sm:text-base leading-tight truncate">{item.productName}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Store size={11} className="text-gold flex-shrink-0" />
                                    <span className="text-gold text-xs font-medium truncate">{item.vendorShopName}</span>
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
                                <span className="w-8 text-center font-semibold text-midnight text-sm">{item.quantity}</span>
                                <button onClick={() => handleQtyChange(1)}
                                    disabled={item.quantity >= maxQty}
                                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors font-bold text-lg leading-none">+</button>
                                {maxQty <= 3 && <span className="text-xs text-amber-600 font-medium">Only {maxQty} left</span>}
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-midnight text-base">{formatCurrency(item.subtotal + item.depositTotal)}</p>
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
                        <div className="flex justify-between font-semibold text-midnight border-t border-gray-200 pt-1.5">
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
        { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
        { id: 'cod', label: 'Cash on Delivery', icon: Package },
        { id: 'upi', label: 'UPI / Net Banking', icon: Shield },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Review & Confirm Order" size="lg">
            <div className="space-y-5">
                {/* Order summary by vendor */}
                <div className="space-y-3">
                    {Object.entries(vendorGroups).map(([vendorId, { shopName, items }]) => (
                        <div key={vendorId} className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="px-4 py-2.5 bg-gray-50 flex items-center gap-2">
                                <Store size={13} className="text-gold" />
                                <span className="font-semibold text-midnight text-sm">{shopName}</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-3 p-3">
                                        <img src={item.productImage} alt={item.productName}
                                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                                            onError={e => { e.target.src = DEFAULT_IMAGE; }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-midnight text-sm truncate">{item.productName}</p>
                                            <p className="text-gray-400 text-xs">Size: {item.size} · {item.quantity}× · {item.rentalDays}d</p>
                                            <p className="text-xs text-gray-500">{formatDate(item.rentalStartDate)} → {formatDate(item.rentalEndDate)}</p>
                                        </div>
                                        <span className="font-semibold text-midnight text-sm">{formatCurrency(item.subtotal + item.depositTotal)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment method */}
                <div>
                    <p className="text-sm font-semibold text-midnight mb-2">Payment Method</p>
                    <div className="grid grid-cols-3 gap-2">
                        {PAY_METHODS.map(m => (
                            <button key={m.id} onClick={() => setPayMethod(m.id)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${payMethod === m.id ? 'border-gold bg-yellow-50 text-midnight' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                <m.icon size={18} className={payMethod === m.id ? 'text-gold' : 'text-gray-400'} />
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price summary */}
                <div className="bg-gradient-to-br from-midnight to-blue-900 rounded-2xl p-4 text-white space-y-2">
                    <div className="flex justify-between text-sm text-blue-200">
                        <span>Rental Fees</span><span>{formatCurrency(totalRentalFees)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-blue-200">
                        <span>Security Deposits (refundable)</span><span>{formatCurrency(totalDeposits)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-blue-200">
                        <span>Delivery</span><span className="text-green-400 font-medium">FREE</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-blue-700 pt-2">
                        <span>Total Payable</span><span className="text-gold">{formatCurrency(grandTotal)}</span>
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

                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} fullWidth>Cancel</Button>
                    <Button onClick={() => onConfirm(payMethod)} loading={loading} fullWidth>
                        <CreditCard size={15} className="mr-2" /> Confirm & Pay {formatCurrency(grandTotal)}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

// ─── Main CartPage ──────────────────────────────────────────────────────────────
export default function CartPage({ onNavigate }) {
    const { cartItems, removeFromCart, clearCart, cartCount, totalRentalFees, totalDeposits, grandTotal, groupCartByVendor } = useCart();
    const { placeOrder } = useOrders();
    const { allProducts, updateAvailability } = useProducts();
    const toast = useToast();
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [coupon, setCoupon] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);

    const vendorGroups = groupCartByVendor();
    const vendorCount = Object.keys(vendorGroups).length;

    const handleApplyCoupon = () => {
        if (coupon.trim().toUpperCase() === 'STYLE10') {
            setCouponApplied(true);
            toast.success('Coupon STYLE10 applied — 10% off rental fees!');
        } else {
            toast.error('Invalid coupon code');
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

    if (cartItems.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="font-playfair text-2xl font-bold text-midnight">My Cart</h1>
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart size={36} className="text-gray-300" />
                    </div>
                    <h3 className="font-playfair text-xl font-semibold text-gray-500 mb-2">Your cart is empty</h3>
                    <p className="text-gray-400 text-sm mb-6">Browse our luxury collection and add items to rent</p>
                    <Button onClick={() => onNavigate('catalog')}>
                        <ShoppingBag size={16} className="mr-2" /> Browse Products
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-playfair text-2xl font-bold text-midnight">My Cart</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {cartCount} item(s) from {vendorCount} vendor(s)
                    </p>
                </div>
                <button onClick={clearCart}
                    className="text-sm text-red-400 hover:text-red-600 hover:underline transition-colors flex items-center gap-1">
                    <Trash2 size={13} /> Clear All
                </button>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                    Click on <strong>Size</strong> badge or <strong>dates</strong> on any item to edit them inline. Use <strong>STYLE10</strong> for 10% off.
                </p>
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
                                    <CartItemCard key={item.id} item={item} allProducts={allProducts} />
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Coupon */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
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
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden sticky top-24">
                        <div className="bg-gradient-to-r from-midnight to-blue-900 px-5 py-4">
                            <h2 className="font-playfair text-lg font-semibold text-white">Order Summary</h2>
                            <p className="text-blue-300 text-xs mt-0.5">{cartCount} item(s)</p>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Rental Fees</span><span>{formatCurrency(totalRentalFees)}</span>
                            </div>
                            {couponApplied && (
                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                    <span>Discount (STYLE10)</span><span>−{formatCurrency(discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Security Deposits</span><span>{formatCurrency(totalDeposits)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600 font-medium">
                                <span>Delivery</span><span>FREE</span>
                            </div>
                            <div className="flex justify-between font-bold text-midnight border-t border-gray-100 pt-3 text-lg">
                                <span>Total</span><span>{formatCurrency(finalTotal)}</span>
                            </div>
                            <p className="text-xs text-gray-400">Deposits refundable on return</p>

                            <Button fullWidth className="mt-2" onClick={() => setCheckoutOpen(true)}>
                                Proceed to Checkout →
                            </Button>
                            <button onClick={() => onNavigate('catalog')}
                                className="w-full text-center text-sm text-gold hover:underline transition-colors">
                                ← Continue Shopping
                            </button>

                            {/* Gift option */}
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                <Gift size={14} className="text-gold flex-shrink-0" />
                                <p className="text-xs text-gray-500">Add a gift message at checkout</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                onConfirm={handleCheckout}
                loading={loading}
            />
            {loading && <Loader fullPage={true} message="Processing your order..." />}
        </div>
    );
}
