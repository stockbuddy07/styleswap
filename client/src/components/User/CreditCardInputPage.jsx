import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Shield, Lock, CheckCircle, Loader, Eye, EyeOff } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Button from '../Shared/Button';
import LoaderComponent from '../Shared/Loader';
import { formatCurrency } from '../../utils/helpers';

export default function CreditCardInputPage({ onNavigate, onBack }) {
    const { checkoutTemp, setCheckoutTempData, totalRentalFees, totalDeposits, grandTotal, groupCartByVendor } = useCart();
    const toast = useToast();
    const [formData, setFormData] = useState({
        cardType: 'credit', // 'credit' or 'debit'
        number: '',
        expiry: '',
        cvc: '',
        name: '',
        showCvc: false
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [cardFlipped, setCardFlipped] = useState(false);
    const [focusedField, setFocusedField] = useState('');

    const vendorGroups = groupCartByVendor();
    const discount = checkoutTemp?.discount || 0;
    const finalTotal = grandTotal - discount;

    // Simulate card brands
    const getCardBrand = (number) => {
        const visa = /^4/;
        const mastercard = /^5[1-5]/;
        const amex = /^3[47]/;
        if (visa.test(number)) return 'Visa';
        if (mastercard.test(number)) return 'Mastercard';
        if (amex.test(number)) return 'American Express';
        return 'Card';
    };

    const formatCardNumber = (value) => {
        return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    };

    const formatExpiry = (value) => {
        return value.replace(/[^0-9]/g, '').slice(0, 4);
    };

    const formatCvc = (value) => {
        return value.replace(/[^0-9]/g, '').slice(0, 4);
    };

    const luhnCheck = (val) => {
        const sum = val
            .replace(/\s/g, '')
            .split('')
            .reverse()
            .map((x, i) => {
                const digit = parseInt(x);
                return i % 2 === 1 ? digit * 2 > 9 ? digit * 2 - 9 : digit * 2 : digit;
            })
            .reduce((a, b) => a + b, 0);
        return sum % 10 === 0;
    };

    const validateForm = () => {
        const newErrors = {};
        const num = formData.number.replace(/\s/g, '');
        if (!num || num.length < 13) newErrors.number = 'Enter a valid card number';
        else if (!luhnCheck(num)) newErrors.number = 'Invalid card number';
        
        const exp = formData.expiry.replace(/\//g, '');
        if (!exp || exp.length !== 4 || parseInt(exp.slice(0,2)) < 1 || parseInt(exp.slice(0,2)) > 12) {
            newErrors.expiry = 'Enter valid expiry (MM/YY)';
        }
        
        if (!formData.cvc || formData.cvc.length < 3) newErrors.cvc = 'Enter valid CVV';
        if (!formData.name || formData.name.length < 2) newErrors.name = 'Enter cardholder name';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors above');
            return;
        }

        setSubmitting(true);
        setCardFlipped(true);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const num = formData.number.replace(/\s/g, '');
        const masked = '**** **** **** ' + num.slice(-4);
        const brand = getCardBrand(num);

        // Update checkout temp with card details
        setCheckoutTempData({
            ...checkoutTemp,
            cardDetails: {
                type: formData.cardType,
                brand,
                maskedNumber: masked,
                last4: num.slice(-4),
                expiry: formData.expiry
            }
        });

        toast.success('Payment authorized! Proceeding to confirmation...');
        onNavigate('payment-confirmation');
    };

    const handleInputChange = (field, value) => {
        let formattedValue = value;
        if (field === 'number') formattedValue = formatCardNumber(value);
        if (field === 'expiry') formattedValue = formatExpiry(value);
        if (field === 'cvc') formattedValue = formatCvc(value);

        setFormData(prev => ({ ...prev, [field]: formattedValue }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack || (() => onNavigate('cart'))}
                        className="p-3 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 text-midnight"
                        disabled={submitting}
                    >
                        <ArrowLeft size={20} />
                        <span className="font-bold text-sm uppercase tracking-wider hidden sm:inline">Back</span>
                    </button>
                    <div>
                        <h1 className="font-serif text-5xl font-bold text-midnight tracking-tight">Secure Payment</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">Priority Credit/Debit - Instant Authorization</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Card Form */}
                    <div className="space-y-6">
                {/* Card Type Selection */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-100 rounded-3xl">
                    <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <CreditCard size={18} className="text-blue-600" />
                        Card Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'credit', label: 'Credit Card', icon: '💳', desc: 'Rewards & cashback' },
                            { id: 'debit', label: 'Debit Card', icon: '🏦', desc: 'Direct from account' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setFormData(prev => ({ ...prev, cardType: type.id }))}
                                className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 h-28 ${
                                    formData.cardType === type.id 
                                        ? 'border-blue-500 bg-blue-500/10 shadow-xl ring-2 ring-blue-200/50' 
                                        : 'border-gray-200 hover:border-blue-200 hover:shadow-lg'
                                }`}
                            >
                                <span className="text-2xl">{type.icon}</span>
                                <div>
                                    <p className={`font-bold text-sm ${formData.cardType === type.id ? 'text-blue-700' : 'text-gray-800'}`}>
                                        {type.label}
                                    </p>
                                    <p className={`text-xs ${formData.cardType === type.id ? 'text-blue-500' : 'text-gray-500'}`}>
                                        {type.desc}
                                    </p>
                                </div>
                                {formData.cardType === type.id && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                        ✓
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                        {/* Card Preview */}
                        <div className={`group relative perspective-1000 transition-transform duration-500 ${cardFlipped ? 'flipped' : ''}`}>
                            <div className="card-inner relative w-full h-48 max-w-sm bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-white/20 p-6 text-white font-bold overflow-hidden hover:shadow-3xl transition-all duration-500 cursor-default">
                                {/* Front */}
                                <div className="absolute inset-0 backface-hidden">
                                    <div className="h-16 bg-gradient-to-r from-black/30 to-transparent rounded-2xl mb-4 flex items-center pl-6">
                                        <div className={`h-10 w-20 bg-white/20 rounded-xl ${getCardBrand(formData.number)}`}></div>
                                    </div>
                                    <div className="text-2xl font-mono tracking-wider mb-4 h-12 flex items-center pl-6 bg-black/20 rounded-xl pr-6 overflow-hidden">
                                        {formatCardNumber(formData.number || '**** **** **** ****')}
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <div>
                                            <span className="text-gray-300 text-xs uppercase tracking-wider">Cardholder</span>
                                            <div className="font-mono text-lg h-6 truncate bg-black/20 rounded">{formData.name || 'NAME SURNAME'}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-300 text-xs uppercase tracking-wider">Expires</span>
                                            <div className="font-mono text-lg h-6 bg-black/20 rounded w-20 flex items-center justify-center">
                                                {formData.expiry || '**/**'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 right-6 w-20 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <Shield size={20} className="text-white/80" />
                                    </div>
                                </div>
                                {/* Back */}
                                <div className="absolute inset-0 backface-hidden rotate-y-180">
                                    <div className="h-16 bg-black/30 rounded-2xl mt-6 mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-8 bg-black/20 rounded mx-6"></div>
                                        <div className="px-6">
                                            <div className="bg-white/80 rounded-xl h-10 flex items-center justify-center font-mono text-lg tracking-wider">
                                                {formData.cvc || '***'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-6 right-6 text-xs text-gray-300">
                                        CVV is the 3-digit code on back of your card
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <CreditCard size={16} className="text-gold" />
                                    Card Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.number}
                                    onChange={(e) => handleInputChange('number', e.target.value)}
                                    onFocus={() => setFocusedField('number')}
                                    className={`w-full px-5 py-4 border-2 rounded-2xl font-mono text-lg tracking-wider transition-all duration-300 focus:outline-none focus:ring-4 ${
                                        errors.number 
                                            ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                                            : focusedField === 'number' 
                                                ? 'border-gold bg-gold/5 focus:ring-gold/20 shadow-gold/10' 
                                                : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                    disabled={submitting}
                                />
                                {errors.number && <p className="text-red-500 text-xs mt-1 font-medium">{errors.number}</p>}
                                <p className="text-xs text-gray-400 mt-1">Enter the 16-digit number on front of your card</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                                    <input
                                        type="text"
                                        value={formData.expiry}
                                        onChange={(e) => handleInputChange('expiry', e.target.value)}
                                        onFocus={() => setFocusedField('expiry')}
                                        placeholder="MM/YY"
                                        className={`w-full px-4 py-4 border-2 rounded-2xl font-mono text-lg tracking-wider transition-all focus:outline-none focus:ring-4 ${
                                            errors.expiry 
                                                ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                                                : focusedField === 'expiry' 
                                                    ? 'border-gold bg-gold/5 focus:ring-gold/20' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        maxLength={5}
                                        disabled={submitting}
                                    />
                                    {errors.expiry && <p className="text-red-500 text-xs mt-1 font-medium">{errors.expiry}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1 relative">
                                        CVV <span className="text-xs text-gray-400">(3 digits)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={formData.cvc}
                                            onChange={(e) => handleInputChange('cvc', e.target.value)}
                                            onFocus={() => {
                                                setFocusedField('cvc');
                                                setCardFlipped(true);
                                            }}
                                            className={`w-full px-4 py-4 border-2 rounded-2xl font-mono text-lg tracking-wider pr-12 transition-all focus:outline-none focus:ring-4 ${
                                                errors.cvc 
                                                    ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                                                    : focusedField === 'cvc' 
                                                        ? 'border-gold bg-gold/5 focus:ring-gold/20' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            maxLength={4}
                                            disabled={submitting}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, showCvc: !p.showCvc }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/50 transition-colors"
                                            disabled={submitting}
                                        >
                                            {formData.showCvc ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.cvc && <p className="text-red-500 text-xs mt-1 font-medium">{errors.cvc}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Cardholder Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    onFocus={() => setFocusedField('name')}
                                    className={`w-full px-5 py-4 border-2 rounded-2xl text-lg transition-all focus:outline-none focus:ring-4 ${
                                        errors.name 
                                            ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                                            : focusedField === 'name' 
                                                ? 'border-gold bg-gold/5 focus:ring-gold/20' 
                                                : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    placeholder="John Doe"
                                    disabled={submitting}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary & Submit */}
                    <div className="lg:sticky lg:top-8 space-y-6">
                        {/* Quick Summary */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-2xl p-8">
                            <h3 className="font-serif text-2xl font-bold text-midnight mb-6">Order Summary</h3>
                            <div className="space-y-3 mb-8">
                                {Object.entries(vendorGroups).map(([vendorId, group]) => (
                                    <div key={vendorId} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                                        <span className="font-semibold">{group.shopName}</span>
                                        <span className="font-bold text-midnight">{Object.values(group.items).reduce((sum, i) => sum + i.subtotal + i.depositTotal, 0).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 pt-6 border-t border-gray-200">
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    Rental Fees <span>{formatCurrency(totalRentalFees)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        Discount <span>-{formatCurrency(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    Deposits <span>{formatCurrency(totalDeposits)}</span>
                                </div>
                                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />
                                <div className="flex justify-between items-center text-2xl font-black text-midnight">
                                    <span>Total</span>
                                    <span>{formatCurrency(finalTotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4 pt-6 border-t border-gray-100">
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || !formData.number || !formData.expiry || !formData.cvc || !formData.name}
                                className="w-full h-16 !rounded-[2.5rem] !font-black !text-xl shadow-2xl hover:shadow-glow-gold !bg-gradient-to-r !from-emerald-600 !to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 flex items-center justify-center gap-3 uppercase tracking-[0.1em]"
                            >
                                {submitting ? (
                                    <>
                                        <LoaderComponent size="small" color="white" />
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>
                                        Pay {formatCurrency(finalTotal)} <CheckCircle size={24} />
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-gray-400 text-center">
                                Your information is protected with enterprise-grade encryption. We do not store full card details.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {submitting && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <LoaderComponent message="Authorizing payment..." size="large" />
                </div>
            )}

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .card-inner {
                    transform-style: preserve-3d;
                    transition: transform 0.6s cubic-bezier(0.23, 1, 0.320, 1);
                }
                .card-inner.flipped {
                    transform: rotateY(180deg);
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
}

