import React, { useState, useMemo } from 'react';
import {
    ClipboardList, AlertTriangle, Package, Star, MessageSquare,
    AlertCircle, ChevronDown, ChevronUp, Store, Mail,
    Clock, CheckCircle, RotateCcw, Flag, Shield, Truck,
    FileText, Printer, Download, Info, X
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useUsers } from '../../context/UserContext';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import { useToast } from '../../context/ToastContext';

// ─── Star Rating ────────────────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly = false, size = 20 }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button"
                    onClick={() => !readonly && onChange?.(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    disabled={readonly}
                    className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}>
                    <Star size={size}
                        className={`transition-colors ${(hovered || value) >= star ? 'text-gold fill-gold' : 'text-gray-300'}`} />
                </button>
            ))}
        </div>
    );
}

// ─── Item Selector ──────────────────────────────────────────────────────────────
function ItemSelector({ items, selected, onSelect, label = 'Select Item' }) {
    return (
        <div>
            <p className="text-sm font-semibold text-midnight mb-2">
                {label} <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((item, i) => (
                    <button key={i} type="button" onClick={() => onSelect(i)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${selected === i
                            ? 'border-midnight bg-midnight/5 ring-1 ring-midnight'
                            : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                        {/* Radio dot */}
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selected === i ? 'border-midnight' : 'border-gray-300'}`}>
                            {selected === i && <div className="w-2 h-2 rounded-full bg-midnight" />}
                        </div>
                        <img src={item.productImage} alt={item.productName}
                            className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                            onError={e => { e.target.src = 'https://via.placeholder.com/40?text=?'; }} />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-midnight text-xs truncate">{item.productName}</p>
                            <p className="text-gray-400 text-xs">Size {item.size} · ×{item.quantity} · {item.rentalDays}d</p>
                        </div>
                        <span className="text-xs font-semibold text-midnight flex-shrink-0">{formatCurrency(item.subtotal)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Feedback Modal ─────────────────────────────────────────────────────────────
function FeedbackModal({ isOpen, onClose, order, onSubmit }) {
    const [selectedItem, setSelectedItem] = useState(0);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const TAGS = ['Great Quality', 'Perfect Fit', 'On-time Delivery', 'Good Packaging', 'Value for Money', 'Would Rent Again'];
    const toggleTag = (tag) => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

    React.useEffect(() => {
        if (isOpen) {
            setSelectedItem(0);
            if (order?.feedback) {
                setRating(order.feedback.rating || 0);
                setReview(order.feedback.review || '');
                setTags(order.feedback.tags || []);
                setSelectedItem(order.feedback.itemIndex ?? 0);
            } else {
                setRating(0); setReview(''); setTags([]);
            }
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!rating) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        onSubmit({ rating, review, tags, itemIndex: selectedItem, itemName: order?.items?.[selectedItem]?.productName });
        setLoading(false);
        onClose();
    };

    const items = order?.items || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Rental Experience" size="md">
            <div className="space-y-5">
                {/* Item selector */}
                {items.length > 0 && (
                    <ItemSelector
                        items={items}
                        selected={selectedItem}
                        onSelect={setSelectedItem}
                        label="Which item are you reviewing?" />
                )}

                {/* Order ref */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-500">
                    <Store size={12} className="text-gold" />
                    <span>{order?.shopName}</span>
                    <span className="ml-auto font-mono">#{order?.orderId?.slice(-8).toUpperCase()}</span>
                </div>

                {/* Star rating */}
                <div className="text-center">
                    <p className="text-sm font-semibold text-midnight mb-3">Overall Experience</p>
                    <div className="flex justify-center">
                        <StarRating value={rating} onChange={setRating} size={32} />
                    </div>
                    {rating > 0 && (
                        <p className="text-sm text-gold font-medium mt-2">
                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating]}
                        </p>
                    )}
                </div>

                {/* Quick tags */}
                <div>
                    <p className="text-sm font-semibold text-midnight mb-2">What did you like? (optional)</p>
                    <div className="flex flex-wrap gap-2">
                        {TAGS.map(tag => (
                            <button key={tag} type="button" onClick={() => toggleTag(tag)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${tags.includes(tag) ? 'bg-midnight text-white border-midnight' : 'border-gray-200 text-gray-600 hover:border-midnight'}`}>
                                {tags.includes(tag) && <CheckCircle size={10} className="inline mr-1" />}
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Written review */}
                <div>
                    <label className="text-sm font-semibold text-midnight block mb-2">Write a Review (optional)</label>
                    <textarea value={review} onChange={e => setReview(e.target.value)}
                        rows={3} maxLength={500}
                        placeholder="Share your experience with other customers..."
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold resize-none" />
                    <p className="text-xs text-gray-400 text-right mt-1">{review.length}/500</p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} fullWidth>Cancel</Button>
                    <Button onClick={handleSubmit} loading={loading} disabled={!rating} fullWidth>
                        <Star size={14} className="mr-1.5" />
                        {order?.feedback ? 'Update Review' : 'Submit Review'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

// ─── Issue Modal ────────────────────────────────────────────────────────────────
function IssueModal({ isOpen, onClose, order, onSubmit }) {
    const [selectedItem, setSelectedItem] = useState(0);
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const ISSUE_TYPES = [
        { id: 'damaged', label: 'Item Damaged', icon: AlertCircle },
        { id: 'wrong_item', label: 'Wrong Item Sent', icon: Package },
        { id: 'late_delivery', label: 'Late Delivery', icon: Clock },
        { id: 'size_issue', label: 'Size Mismatch', icon: Info },
        { id: 'quality', label: 'Quality Issue', icon: Flag },
        { id: 'other', label: 'Other', icon: MessageSquare },
    ];

    React.useEffect(() => {
        if (isOpen) { setSelectedItem(0); setType(''); setDescription(''); }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!type || !description.trim()) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        onSubmit({
            type, description,
            itemIndex: selectedItem,
            itemName: order?.items?.[selectedItem]?.productName,
        });
        setLoading(false);
        setType(''); setDescription('');
        onClose();
    };

    const items = order?.items || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Report an Issue" size="md">
            <div className="space-y-5">
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">Our support team will review your issue and respond within 24 hours.</p>
                </div>

                {/* Item selector */}
                {items.length > 0 && (
                    <ItemSelector
                        items={items}
                        selected={selectedItem}
                        onSelect={setSelectedItem}
                        label="Which item has the issue?" />
                )}

                {/* Issue type */}
                <div>
                    <p className="text-sm font-semibold text-midnight mb-2">Issue Type <span className="text-red-500">*</span></p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ISSUE_TYPES.map(t => (
                            <button key={t.id} type="button" onClick={() => setType(t.id)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${type === t.id ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                <t.icon size={16} className={type === t.id ? 'text-red-500' : 'text-gray-400'} />
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="text-sm font-semibold text-midnight block mb-2">
                        Describe the Issue <span className="text-red-500">*</span>
                    </label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                        rows={4} maxLength={1000}
                        placeholder="Please describe the issue in detail so we can resolve it quickly..."
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold resize-none" />
                    <p className="text-xs text-gray-400 text-right mt-1">{description.length}/1000</p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} fullWidth>Cancel</Button>
                    <Button variant="danger" onClick={handleSubmit} loading={loading}
                        disabled={!type || !description.trim()} fullWidth>
                        <Flag size={14} className="mr-1.5" /> Submit Issue
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

// ─── Invoice Modal ──────────────────────────────────────────────────────────────
function InvoiceModal({ isOpen, onClose, order }) {
    if (!order) return null;

    const rentalTotal = order.items?.reduce((s, i) => s + (i.subtotal || 0), 0) || order.totalAmount || 0;
    const depositTotal = order.items?.reduce((s, i) => s + (i.depositTotal || 0), 0) || 0;
    const grandTotal = rentalTotal + depositTotal;
    const invoiceNo = `INV-${order.orderId?.slice(-8).toUpperCase()}`;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handlePrint = () => window.print();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invoice" size="lg">
            <div className="space-y-0">
                {/* Invoice document */}
                <div id="invoice-doc" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Header band */}
                    <div className="bg-gradient-to-r from-midnight to-blue-900 px-6 py-5 flex justify-between items-start">
                        <div>
                            <h2 className="font-playfair text-2xl font-bold text-white tracking-wide">StyleSwap</h2>
                            <p className="text-blue-300 text-xs mt-0.5">Luxury Fashion Rentals</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-bold text-lg">{invoiceNo}</p>
                            <p className="text-blue-300 text-xs">Issued: {today}</p>
                            <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${order.status === 'Returned' ? 'bg-green-400/20 text-green-300' : 'bg-amber-400/20 text-amber-300'}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    <div className="px-6 py-5 space-y-5">
                        {/* Billed to / Vendor */}
                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</p>
                                <p className="font-semibold text-midnight">{order.customerName || 'Customer'}</p>
                                <p className="text-gray-500 text-xs">StyleSwap Member</p>
                                <p className="text-gray-500 text-xs">Order Date: {formatDate(order.orderDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vendor</p>
                                <p className="font-semibold text-midnight">{order.shopName}</p>
                                <p className="text-gray-500 text-xs">StyleSwap Verified Partner</p>
                                {order.paymentMethod && (
                                    <p className="text-gray-500 text-xs">Payment: {order.paymentMethod}</p>
                                )}
                            </div>
                        </div>

                        {/* Rental period */}
                        <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
                            <Clock size={15} className="text-midnight flex-shrink-0" />
                            <span className="text-gray-600">Rental Period:</span>
                            <span className="font-semibold text-midnight">
                                {formatDate(order.rentalStartDate)} → {formatDate(order.rentalEndDate)}
                            </span>
                        </div>

                        {/* Line items */}
                        <div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-100">
                                        <th className="text-left py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
                                        <th className="text-center py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Size</th>
                                        <th className="text-center py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                                        <th className="text-center py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Days</th>
                                        <th className="text-right py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Rental</th>
                                        <th className="text-right py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Deposit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.items?.map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <img src={item.productImage} alt={item.productName}
                                                        className="w-9 h-9 object-cover rounded-lg flex-shrink-0"
                                                        onError={e => { e.target.src = 'https://via.placeholder.com/36?text=?'; }} />
                                                    <span className="font-medium text-midnight text-xs leading-tight max-w-[140px] truncate">{item.productName}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-center text-xs text-gray-600">{item.size}</td>
                                            <td className="py-3 text-center text-xs text-gray-600">{item.quantity}</td>
                                            <td className="py-3 text-center text-xs text-gray-600">{item.rentalDays}</td>
                                            <td className="py-3 text-right text-xs font-medium text-midnight">{formatCurrency(item.subtotal || 0)}</td>
                                            <td className="py-3 text-right text-xs text-gray-500">{formatCurrency(item.depositTotal || 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="border-t-2 border-gray-100 pt-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Rental Subtotal</span><span>{formatCurrency(rentalTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Security Deposits (refundable)</span><span>{formatCurrency(depositTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600 font-medium">
                                <span>Delivery Charges</span><span>FREE</span>
                            </div>
                            <div className="flex justify-between font-bold text-midnight text-lg border-t border-gray-200 pt-3">
                                <span>Total Paid</span>
                                <span className="text-gold">{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>

                        {/* Footer note */}
                        <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 space-y-1">
                            <p>• Security deposits are refunded within 3–5 business days after item return in good condition.</p>
                            <p>• This is a computer-generated invoice and does not require a signature.</p>
                            <p>• For support, contact us at <span className="text-gold">support@styleswap.com</span></p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={onClose} fullWidth>Close</Button>
                    <Button variant="outline" onClick={handlePrint} fullWidth>
                        <Printer size={14} className="mr-1.5" /> Print Invoice
                    </Button>
                    <Button fullWidth onClick={() => {
                        // Demo: copy invoice number to clipboard
                        navigator.clipboard?.writeText(invoiceNo);
                        alert(`Invoice ${invoiceNo} — In a production app this would download a PDF.`);
                    }}>
                        <Download size={14} className="mr-1.5" /> Download PDF
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

// ─── Vendor Details Panel ───────────────────────────────────────────────────────
function VendorDetailsPanel({ vendorId, shopName }) {
    const { users } = useUsers();
    const vendor = users.find(u => u.id === vendorId);
    if (!vendor) return null;
    return (
        <div className="bg-gradient-to-br from-midnight to-blue-900 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
                    <Store size={18} className="text-gold" />
                </div>
                <div>
                    <p className="font-semibold text-white">{shopName}</p>
                    <p className="text-blue-300 text-xs">Verified Vendor</p>
                </div>
                <div className="ml-auto">
                    <span className="badge bg-green-500/20 text-green-300 border border-green-500/30">
                        <CheckCircle size={10} className="mr-1" /> Active
                    </span>
                </div>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-blue-200">
                    <Mail size={13} className="text-gold flex-shrink-0" />
                    <span className="truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-200">
                    <Shield size={13} className="text-gold flex-shrink-0" />
                    <span>StyleSwap Verified Partner</span>
                </div>
                <div className="flex items-center gap-2 text-blue-200">
                    <Truck size={13} className="text-gold flex-shrink-0" />
                    <span>Free doorstep delivery &amp; pickup</span>
                </div>
            </div>
        </div>
    );
}

// ─── Order Card ─────────────────────────────────────────────────────────────────
function OrderCard({ order }) {
    const { submitFeedback, raiseIssue } = useOrders();
    const toast = useToast();
    const [expanded, setExpanded] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [issueOpen, setIssueOpen] = useState(false);
    const [invoiceOpen, setInvoiceOpen] = useState(false);
    const [showVendor, setShowVendor] = useState(false);

    const statusColors = {
        Active: 'bg-green-100 text-green-800 border-green-200',
        'Pending Return': 'bg-amber-100 text-amber-800 border-amber-200',
        Overdue: 'bg-red-100 text-red-800 border-red-200',
        Returned: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    const statusIcons = {
        Active: <CheckCircle size={12} />,
        'Pending Return': <Clock size={12} />,
        Overdue: <AlertTriangle size={12} />,
        Returned: <RotateCcw size={12} />,
    };

    const openIssues = (order.issues || []).filter(i => i.status === 'Open').length;

    const handleFeedbackSubmit = (data) => {
        submitFeedback(order.orderId, data);
        toast.success(order.feedback ? 'Review updated!' : 'Review submitted! Thank you 🙏');
    };
    const handleIssueSubmit = (data) => {
        raiseIssue(order.orderId, data);
        toast.success('Issue reported. Our team will respond within 24 hours.');
    };

    return (
        <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${order.status === 'Overdue' ? 'border-red-200 shadow-red-50' : 'border-gray-100'}`}>
            {/* Overdue banner */}
            {order.status === 'Overdue' && (
                <div className="bg-red-500 text-white text-xs font-semibold px-4 py-2 flex items-center gap-2">
                    <AlertTriangle size={13} /> This rental is overdue — please return immediately to avoid extra charges
                </div>
            )}

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-bold text-midnight text-sm">
                            #{order.orderId?.slice(-8).toUpperCase()}
                        </span>
                        <span className={`badge border flex items-center gap-1 ${statusColors[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {statusIcons[order.status]}
                            {order.status}
                        </span>
                        {openIssues > 0 && (
                            <span className="badge bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1">
                                <AlertCircle size={10} /> {openIssues} open issue{openIssues > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-midnight text-lg">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.orderDate)}</p>
                    </div>
                </div>

                {/* Dates & vendor */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(order.rentalStartDate)} → {formatDate(order.rentalEndDate)}
                    </span>
                    <button onClick={() => setShowVendor(v => !v)}
                        className="flex items-center gap-1 text-gold hover:underline">
                        <Store size={11} /> {order.shopName}
                        {showVendor ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    </button>
                </div>
            </div>

            {/* Vendor details panel */}
            {showVendor && (
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <VendorDetailsPanel vendorId={order.vendorId} shopName={order.shopName} />
                </div>
            )}

            {/* Items preview */}
            <div className="px-5 py-4">
                <div className="flex gap-3 overflow-x-auto pb-1">
                    {order.items?.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex-shrink-0 flex items-center gap-2.5 bg-gray-50 rounded-xl p-2.5 min-w-0">
                            <img src={item.productImage} alt={item.productName}
                                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                                onError={e => { e.target.src = 'https://via.placeholder.com/48?text=?'; }} />
                            <div className="min-w-0">
                                <p className="font-medium text-midnight text-xs truncate max-w-[120px]">{item.productName}</p>
                                <p className="text-gray-400 text-xs">Size {item.size} · ×{item.quantity}</p>
                                <p className="text-gold text-xs font-medium">{formatCurrency(item.subtotal)}</p>
                            </div>
                        </div>
                    ))}
                    {order.items?.length > 3 && (
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-500 font-medium self-center">
                            +{order.items.length - 3}
                        </div>
                    )}
                </div>

                {/* Expandable full details */}
                <button onClick={() => setExpanded(v => !v)}
                    className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {expanded ? 'Hide' : 'View'} full order details
                </button>

                {expanded && (
                    <div className="mt-3 space-y-3">
                        {/* All items */}
                        <div className="space-y-2">
                            {order.items?.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                                    <img src={item.productImage} alt={item.productName}
                                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                                        onError={e => { e.target.src = 'https://via.placeholder.com/56?text=?'; }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-midnight text-sm">{item.productName}</p>
                                        <p className="text-gray-500 text-xs">Size: {item.size} · Qty: {item.quantity} · {item.rentalDays} days</p>
                                        <p className="text-gray-400 text-xs">{formatDate(item.rentalStartDate)} → {formatDate(item.rentalEndDate)}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-midnight text-sm">{formatCurrency(item.subtotal)}</p>
                                        <p className="text-xs text-gray-400">+{formatCurrency(item.depositTotal || 0)} dep.</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Payment info */}
                        <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5">
                            <div className="flex justify-between text-gray-600">
                                <span>Rental Total</span><span>{formatCurrency(order.totalAmount)}</span>
                            </div>
                            {order.paymentMethod && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Payment</span><span className="font-medium">{order.paymentMethod}</span>
                                </div>
                            )}
                        </div>

                        {/* Issues list */}
                        {order.issues?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-midnight mb-2">Reported Issues</p>
                                <div className="space-y-2">
                                    {order.issues.map(issue => (
                                        <div key={issue.issueId} className={`p-3 rounded-xl border text-xs ${issue.status === 'Resolved' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                                            <div className="flex justify-between mb-1">
                                                <div>
                                                    <span className="font-semibold capitalize text-midnight">{issue.type?.replace('_', ' ')}</span>
                                                    {issue.itemName && <span className="text-gray-400 ml-1">· {issue.itemName}</span>}
                                                </div>
                                                <span className={`badge ${issue.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {issue.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-600">{issue.description}</p>
                                            {issue.adminResponse && (
                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                    <p className="text-gray-500 font-medium">Support Response:</p>
                                                    <p className="text-gray-600">{issue.adminResponse}</p>
                                                </div>
                                            )}
                                            <p className="text-gray-400 mt-1">Raised: {formatDate(issue.raisedAt)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Feedback display */}
            {order.feedback && (
                <div className="px-5 pb-4">
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <StarRating value={order.feedback.rating} readonly size={14} />
                                {order.feedback.itemName && (
                                    <span className="text-xs text-gray-400">for {order.feedback.itemName}</span>
                                )}
                                <span className="text-xs text-gray-400">{formatDate(order.feedback.submittedAt)}</span>
                            </div>
                            <button onClick={() => setFeedbackOpen(true)}
                                className="text-xs text-gold hover:underline">Edit</button>
                        </div>
                        {order.feedback.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                                {order.feedback.tags.map(t => (
                                    <span key={t} className="badge bg-yellow-100 text-yellow-700 text-xs">{t}</span>
                                ))}
                            </div>
                        )}
                        {order.feedback.review && (
                            <p className="text-xs text-gray-600 italic">"{order.feedback.review}"</p>
                        )}
                    </div>
                </div>
            )}

            {/* Action buttons — no Track Order */}
            <div className="px-5 pb-4 flex flex-wrap gap-2">
                {/* Feedback */}
                {(order.status === 'Returned' || order.status === 'Active') && (
                    <button onClick={() => setFeedbackOpen(true)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${order.feedback ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' : 'bg-white text-gray-600 border-gray-200 hover:border-gold hover:text-gold'}`}>
                        <Star size={13} className={order.feedback ? 'fill-gold text-gold' : ''} />
                        {order.feedback ? 'Update Review' : 'Write a Review'}
                    </button>
                )}

                {/* Report Issue */}
                {order.status !== 'Returned' && (
                    <button onClick={() => setIssueOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all bg-white">
                        <Flag size={13} /> Report Issue
                    </button>
                )}

                {/* Invoice */}
                <button onClick={() => setInvoiceOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-600 hover:border-midnight hover:text-midnight hover:bg-gray-50 transition-all bg-white ml-auto">
                    <FileText size={13} /> View Invoice
                </button>
            </div>

            <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)}
                order={order} onSubmit={handleFeedbackSubmit} />
            <IssueModal isOpen={issueOpen} onClose={() => setIssueOpen(false)}
                order={order} onSubmit={handleIssueSubmit} />
            <InvoiceModal isOpen={invoiceOpen} onClose={() => setInvoiceOpen(false)}
                order={order} />
        </div>
    );
}

// ─── Main MyRentals ─────────────────────────────────────────────────────────────
export default function MyRentals({ onNavigate }) {
    const { userOrders } = useOrders();
    const [filter, setFilter] = useState('All');

    const FILTERS = ['All', 'Active', 'Pending Return', 'Overdue', 'Returned'];

    const sorted = useMemo(() =>
        [...userOrders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)),
        [userOrders]
    );

    const filtered = filter === 'All' ? sorted : sorted.filter(o => o.status === filter);

    const counts = useMemo(() => {
        const c = { All: sorted.length };
        FILTERS.slice(1).forEach(f => { c[f] = sorted.filter(o => o.status === f).length; });
        return c;
    }, [sorted]);

    const overdue = sorted.filter(o => o.status === 'Overdue');
    const pendingReturn = sorted.filter(o => o.status === 'Pending Return');

    if (sorted.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="font-playfair text-2xl font-bold text-midnight">My Rentals</h1>
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList size={36} className="text-gray-300" />
                    </div>
                    <h3 className="font-playfair text-xl font-semibold text-gray-500 mb-2">No rentals yet</h3>
                    <p className="text-gray-400 text-sm mb-6">Start browsing and rent your first luxury item!</p>
                    <Button onClick={() => onNavigate('catalog')}>
                        <Package size={16} className="mr-2" /> Browse Products
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-playfair text-2xl font-bold text-midnight">My Rentals</h1>
                <p className="text-gray-500 text-sm mt-1">{sorted.length} total rental(s)</p>
            </div>

            {/* Alert banners */}
            {overdue.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-700">⚠️ {overdue.length} Overdue Rental{overdue.length > 1 ? 's' : ''}</p>
                        <p className="text-red-600 text-sm mt-0.5">Please return items immediately to avoid additional charges and penalties.</p>
                    </div>
                </div>
            )}
            {pendingReturn.length > 0 && overdue.length === 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <Clock size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-amber-700">{pendingReturn.length} item{pendingReturn.length > 1 ? 's' : ''} due for return soon</p>
                        <p className="text-amber-600 text-sm mt-0.5">Please schedule your return pickup to avoid overdue charges.</p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Orders', value: sorted.length, color: 'text-midnight' },
                    { label: 'Active', value: counts['Active'] || 0, color: 'text-green-600' },
                    { label: 'Overdue', value: counts['Overdue'] || 0, color: 'text-red-600' },
                    { label: 'Returned', value: counts['Returned'] || 0, color: 'text-gray-500' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-gray-500 text-xs mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {FILTERS.map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-midnight text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-midnight'}`}>
                        {f}
                        {counts[f] > 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {counts[f]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Orders */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <p className="text-gray-400">No {filter.toLowerCase()} rentals found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(order => (
                        <OrderCard key={order.orderId} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
