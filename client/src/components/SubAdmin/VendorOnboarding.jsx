import React, { useState } from 'react';
import {
    Store, MapPin, Hash, Phone, FileText, User,
    CheckCircle, ArrowRight, Sparkles, Shield, Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../Shared/Button';

const FIELD_CONFIG = [
    {
        key: 'shopAddress',
        label: 'Shop / Business Address',
        placeholder: '123 Fashion Street, Mumbai, Maharashtra 400001',
        icon: MapPin,
        type: 'textarea',
        required: true,
        hint: 'Full address where customers can visit or return items',
    },
    {
        key: 'shopNumber',
        label: 'Shop Registration Number',
        placeholder: 'e.g. SHOP/MH/2024/001234',
        icon: Hash,
        type: 'text',
        required: true,
        hint: 'Your official shop registration or trade license number',
    },
    {
        key: 'mobileNumber',
        label: 'Primary Mobile Number',
        placeholder: '+91 98765 43210',
        icon: Phone,
        type: 'tel',
        required: true,
        hint: 'Main contact number for customers and StyleSwap',
    },
    {
        key: 'salesHandlerMobile',
        label: 'Sales Handler Mobile Number',
        placeholder: '+91 91234 56789',
        icon: User,
        type: 'tel',
        required: true,
        hint: 'Person responsible for handling orders and deliveries',
    },
    {
        key: 'gstNumber',
        label: 'GST Number',
        placeholder: '22AAAAA0000A1Z5',
        icon: FileText,
        type: 'text',
        required: false,
        hint: 'Optional — required for businesses with annual turnover > ₹20L',
    },
];

function FieldInput({ config, value, onChange, error }) {
    const Icon = config.icon;
    const base = `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold transition-all pl-11 ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300 focus:border-gold'}`;

    return (
        <div>
            <label className="block text-sm font-semibold text-midnight mb-1.5">
                {config.label}
                {config.required
                    ? <span className="text-red-500 ml-1">*</span>
                    : <span className="text-gray-400 text-xs font-normal ml-2">(Optional)</span>
                }
            </label>
            <div className="relative">
                <div className="absolute left-3 top-3.5 text-gray-400">
                    <Icon size={16} />
                </div>
                {config.type === 'textarea' ? (
                    <textarea
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={config.placeholder}
                        rows={2}
                        className={`${base} resize-none`}
                    />
                ) : (
                    <input
                        type={config.type}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={config.placeholder}
                        className={base}
                    />
                )}
            </div>
            {error
                ? <p className="text-red-500 text-xs mt-1">{error}</p>
                : <p className="text-gray-400 text-xs mt-1">{config.hint}</p>
            }
        </div>
    );
}

export default function VendorOnboarding() {
    const { currentUser, updateCurrentUser } = useAuth();
    const toast = useToast();

    const [form, setForm] = useState({
        shopAddress: currentUser?.shopAddress || '',
        shopNumber: currentUser?.shopNumber || '',
        mobileNumber: currentUser?.mobileNumber || '',
        salesHandlerMobile: currentUser?.salesHandlerMobile || '',
        gstNumber: currentUser?.gstNumber || '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validate = () => {
        const errs = {};
        FIELD_CONFIG.forEach(f => {
            if (f.required && !form[f.key]?.trim()) {
                errs[f.key] = `${f.label} is required`;
            }
        });
        // Basic phone validation
        ['mobileNumber', 'salesHandlerMobile'].forEach(k => {
            if (form[k] && !/^[\d\s\+\-\(\)]{7,15}$/.test(form[k].replace(/\s/g, ''))) {
                errs[k] = 'Enter a valid phone number';
            }
        });
        // GST format (if provided)
        if (form.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.toUpperCase())) {
            errs.gstNumber = 'Enter a valid 15-character GST number';
        }
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        await new Promise(r => setTimeout(r, 700));
        updateCurrentUser({
            ...form,
            gstNumber: form.gstNumber.toUpperCase() || null,
            onboardedAt: new Date().toISOString(),
        });
        setLoading(false);
        setSubmitted(true);
        toast.success('Shop profile saved! You can now list products. 🎉');
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-midnight via-blue-900 to-midnight flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h2 className="font-playfair text-2xl font-bold text-midnight mb-2">You're all set!</h2>
                    <p className="text-gray-500 text-sm mb-6">Your shop profile is complete. You can now list products and start earning.</p>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                            { icon: Store, label: 'List Products' },
                            { icon: Star, label: 'Get Reviews' },
                            { icon: Shield, label: 'Verified Seller' },
                        ].map(f => (
                            <div key={f.label} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl">
                                <f.icon size={18} className="text-gold" />
                                <span className="text-xs text-gray-600 font-medium">{f.label}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400">Redirecting to your dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-midnight via-blue-950 to-midnight flex items-center justify-center p-4">
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-xl relative">
                {/* Header card */}
                <div className="bg-gradient-to-r from-gold to-yellow-500 rounded-3xl p-6 mb-4 shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Store size={24} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-playfair text-xl font-bold text-white">Complete Your Shop Profile</h1>
                                <Sparkles size={16} className="text-white/70" />
                            </div>
                            <p className="text-yellow-100 text-xs">Welcome, {currentUser?.name}! One last step before you go live.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
                        <Shield size={13} className="text-white flex-shrink-0" />
                        <p className="text-white text-xs">This information helps customers trust your shop and enables StyleSwap to verify your business.</p>
                    </div>
                </div>

                {/* Form card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Progress indicator */}
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">Shop Details</span>
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-6 h-1.5 rounded-full bg-gold" />
                            ))}
                            <div className="w-6 h-1.5 rounded-full bg-gray-200" />
                        </div>
                        <span className="text-xs text-gray-400">4 of 5 required</span>
                    </div>

                    <div className="p-6 space-y-5">
                        {FIELD_CONFIG.map(config => (
                            <FieldInput
                                key={config.key}
                                config={config}
                                value={form[config.key]}
                                onChange={val => {
                                    setForm(f => ({ ...f, [config.key]: val }));
                                    if (errors[config.key]) setErrors(e => ({ ...e, [config.key]: null }));
                                }}
                                error={errors[config.key]}
                            />
                        ))}

                        {/* Mandatory note */}
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <Shield size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">
                                Fields marked <span className="text-red-500 font-bold">*</span> are mandatory. You can explore the dashboard freely, but <strong>product listing requires a complete profile</strong>.
                            </p>
                        </div>

                        <Button fullWidth onClick={handleSubmit} loading={loading} className="!py-3.5 !text-base">
                            Save & Go to Dashboard <ArrowRight size={16} className="ml-2" />
                        </Button>

                        <p className="text-center text-xs text-gray-400">
                            You can update these details anytime from your profile settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
