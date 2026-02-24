import React, { useState } from 'react';
import {
    Store, MapPin, Hash, Phone, FileText, User,
    CheckCircle, ArrowRight, Sparkles, Shield, Star, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const FIELD_CONFIG = [
    {
        key: 'shopAddress',
        label: 'Establishment Location',
        placeholder: '123 Avenue de Luxe, Mumbai, MH 400001',
        icon: MapPin,
        type: 'textarea',
        required: true,
        hint: 'Verified business address for client trust',
    },
    {
        key: 'shopNumber',
        label: 'Official Registration ID',
        placeholder: 'e.g. REG/MH/2024/001234',
        icon: Hash,
        type: 'text',
        required: true,
        hint: 'Trade license or Shop Act number',
    },
    {
        key: 'mobileNumber',
        label: 'Direct Contact Line',
        placeholder: '+91 98765 43210',
        icon: Phone,
        type: 'tel',
        required: true,
        hint: 'Primary line for network communications',
    },
    {
        key: 'salesHandlerMobile',
        label: 'Protocol Manager Contact',
        placeholder: '+91 91234 56789',
        icon: User,
        type: 'tel',
        required: true,
        hint: 'Lead representative for order fulfillment',
    },
    {
        key: 'gstNumber',
        label: 'GST Certification',
        placeholder: '22AAAAA0000A1Z5',
        icon: FileText,
        type: 'text',
        required: false,
        hint: 'Recommended for institutional credibility',
    },
];

const darkInputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all placeholder:text-gray-600 pl-12";
const darkLabelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block ml-1";

function FieldInput({ config, value, onChange, error }) {
    const Icon = config.icon;
    return (
        <div className="group">
            <label className={darkLabelClass}>
                {config.label}
                {config.required && <span className="text-gold ml-1 text-xs">*</span>}
            </label>
            <div className="relative">
                <div className="absolute left-4 top-4.5 py-4 text-gray-500 group-focus-within:text-gold transition-colors">
                    <Icon size={16} />
                </div>
                {config.type === 'textarea' ? (
                    <textarea
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={config.placeholder}
                        rows={2}
                        className={`${darkInputClass} resize-none`}
                    />
                ) : (
                    <input
                        type={config.type}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={config.placeholder}
                        className={darkInputClass}
                    />
                )}
            </div>
            {error ? (
                <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold">{error}</p>
            ) : (
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-2 ml-1">{config.hint}</p>
            )}
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
        ['mobileNumber', 'salesHandlerMobile'].forEach(k => {
            if (form[k] && !/^[\d\s\+\-\(\)]{7,15}$/.test(form[k].replace(/\s/g, ''))) {
                errs[k] = 'Invalid line format';
            }
        });
        if (form.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.toUpperCase())) {
            errs.gstNumber = 'Invalid GST format';
        }
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        updateCurrentUser({
            ...form,
            gstNumber: form.gstNumber.toUpperCase() || null,
            onboardedAt: new Date().toISOString(),
        });
        setLoading(false);
        setSubmitted(true);
        toast.success('Portfolio Status: Active 🎉');
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight-deep to-midnight flex items-center justify-center p-6 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent)] pointer-events-none" />
                <div className="relative w-full max-w-xl bg-midnight/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 text-center animate-luxury-pop shadow-3xl group hover:border-gold/30 transition-all duration-1000">
                    <div className="w-24 h-24 bg-gold rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-glow animate-luxury-entry stagger-1">
                        <CheckCircle size={48} className="text-midnight" />
                    </div>
                    <h2 className="font-playfair text-4xl font-black text-white mb-4 animate-luxury-entry stagger-2">Portfolio Activated</h2>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-12 animate-luxury-entry stagger-3">Your workshop is now live across the network</p>

                    <div className="grid grid-cols-3 gap-6 mb-12 animate-luxury-entry stagger-4">
                        {[
                            { icon: Store, label: 'Market Access' },
                            { icon: Star, label: 'Curated Status' },
                            { icon: Shield, label: 'Verified Hub' },
                        ].map(f => (
                            <div key={f.label} className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-[2rem] border border-white/5 group/icon hover:border-gold/30 transition-all">
                                <f.icon size={24} className="text-gold group-hover/icon:scale-110 transition-transform" />
                                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{f.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-3 text-gold/60 text-[10px] font-black uppercase tracking-widest animate-luxury-entry stagger-5">
                        <Clock size={14} className="animate-spin-slow" />
                        Initializing Dashboard...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight-deep to-midnight flex items-center justify-center p-6 text-white relative overflow-hidden">
            {/* Ambient effects */}
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-2xl relative">
                {/* Visual Header */}
                <div className="bg-gradient-to-r from-gold via-yellow-500 to-gold-dark rounded-[3rem] p-10 mb-8 shadow-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="relative z-10 flex items-center gap-8">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform duration-700">
                            <Store size={40} className="text-white" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="font-playfair text-3xl font-black text-white tracking-tight leading-none">Workshop Verification</h1>
                            <div className="flex items-center gap-3">
                                <Sparkles size={16} className="text-white/60" />
                                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Finalizing Partner Access Profile</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form Interface */}
                <div className="bg-midnight/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden animate-luxury-pop">
                    {/* Header Strip */}
                    <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-3">
                            <Shield size={14} className="text-gold" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Business Intelligence Hub</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-6 h-1 bg-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
                            ))}
                            <div className="w-6 h-1 bg-white/10 rounded-full" />
                        </div>
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {FIELD_CONFIG.map(config => (
                                <div key={config.key} className={config.key === 'shopAddress' ? 'md:col-span-2' : ''}>
                                    <FieldInput
                                        config={config}
                                        value={form[config.key]}
                                        onChange={val => {
                                            setForm(f => ({ ...f, [config.key]: val }));
                                            if (errors[config.key]) setErrors(e => ({ ...e, [config.key]: null }));
                                        }}
                                        error={errors[config.key]}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Note */}
                        <div className="p-6 bg-gold/5 border border-gold/10 rounded-3xl flex items-start gap-4">
                            <Shield size={18} className="text-gold mt-1 flex-shrink-0" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                                Portfolio Authenticity Statement: Complete profile required for asset publication. Data protected by network encryption protocol.
                            </p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-5 bg-gold text-midnight rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 hover:shadow-glow transition-all duration-500 shadow-2xl flex items-center justify-center gap-3"
                        >
                            {loading ? 'Processing Protocol...' : (
                                <>Verify & Activate Dashboard <ArrowRight size={18} strokeWidth={3} /></>
                            )}
                        </button>

                        <p className="text-center text-[10px] text-gray-700 font-black uppercase tracking-widest">
                            StyleSwap Partner Program © 2024
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
