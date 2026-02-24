import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Store, X, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import { checkPasswordStrength } from '../../utils/helpers';
import LaserFlow from './LaserFlow';

export default function Register({ onNavigate, onClose }) {
    const { register } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'User',
        shopName: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [authError, setAuthError] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleClose = () => {
        if (onClose) onClose();
        else if (onNavigate) onNavigate('catalog');
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Required';
        if (!form.email.trim()) errs.email = 'Required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid';
        if (!form.password) errs.password = 'Required';
        else if (form.password.length < 6) errs.password = 'Min 6 chars';
        if (!form.confirmPassword) errs.confirmPassword = 'Required';
        else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mismatch';
        if (form.role === 'Sub-Admin' && !form.shopName.trim()) errs.shopName = 'Required';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setAuthError('');
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.role, form.shopName || null);
            setSuccess(true);
            setTimeout(() => {
                if (onNavigate) onNavigate('catalog');
            }, 2000);
        } catch (err) {
            setAuthError(err.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    const strength = checkPasswordStrength(form.password);
    const strengthColors = { weak: 'bg-red-400', medium: 'bg-yellow-400', strong: 'bg-green-400' };
    const strengthWidths = { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' };

    const THEME_PRIMARY = "midnight-deep";
    const ACCENT_GOLD = "#D4AF37";
    const ACCENT_INDIGO = "#1E293B";

    if (success) {
        return (
            <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-${THEME_PRIMARY}/95 backdrop-blur-3xl animate-fade-in`}>
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 text-center max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden">
                    {isMobile && <LaserFlow color1="#10B981" color2={ACCENT_GOLD} />}
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                            <CheckCircle size={32} className="text-green-400" />
                        </div>
                        <h2 className="font-playfair text-3xl font-black text-white mb-2 leading-none">Identity<br /><span className="text-gold italic">Authorized</span></h2>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Entering StyleSwap Sanctuary</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isMobile) {
        return (
            <div className={`fixed inset-0 z-[60] bg-${THEME_PRIMARY} flex flex-col overflow-hidden animate-fade-in h-screen`}>
                <LaserFlow color1={ACCENT_GOLD} color2={ACCENT_INDIGO} />

                <div className="relative z-20 flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gold flex items-center justify-center shadow-glow">
                            <span className="font-black text-midnight text-[10px]">S</span>
                        </div>
                        <h2 className="font-playfair text-lg font-black text-white tracking-tight">StyleSwap</h2>
                    </div>
                    <button onClick={handleClose} className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white">
                        <X size={18} />
                    </button>
                </div>

                <div className="relative z-20 flex-1 flex flex-col justify-center px-4 pb-4">
                    <div className="mb-4 px-2">
                        <span className="text-gold text-[8px] font-black uppercase tracking-[0.3em] block mb-1">New Identity</span>
                        <h1 className="font-playfair text-3xl font-black text-white leading-none">Create <span className="text-gold italic">Account</span></h1>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-5 shadow-2xl flex flex-col gap-4">
                        {authError && (
                            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold text-center">
                                {authError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="NAME"
                                        placeholder="Full Name"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        error={errors.name}
                                        className="!gap-1"
                                        inputClassName="!h-10 !px-3 !text-[11px]"
                                    />
                                    <Input
                                        label="EMAIL"
                                        placeholder="Address"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        error={errors.email}
                                        className="!gap-1"
                                        inputClassName="!h-10 !px-3 !text-[11px]"
                                    />
                                </div>

                                <div className="bg-white/5 rounded-xl border border-white/5 p-1 flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, role: 'User', shopName: '' }))}
                                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${form.role === 'User' ? 'bg-gold text-midnight' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Rent
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, role: 'Sub-Admin' }))}
                                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${form.role === 'Sub-Admin' ? 'bg-gold text-midnight' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Lend
                                    </button>
                                </div>

                                {form.role === 'Sub-Admin' && (
                                    <Input
                                        label="SHOP NAME"
                                        placeholder="Your Boutique"
                                        value={form.shopName}
                                        onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
                                        error={errors.shopName}
                                        className="!gap-1 animate-fade-in"
                                        inputClassName="!h-10 !px-3 !text-[11px] text-gold font-bold"
                                    />
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <Input
                                            label="PASSWORD"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min 6"
                                            value={form.password}
                                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                            error={errors.password}
                                            className="!gap-1"
                                            inputClassName="!h-10 !px-3 !text-[11px]"
                                        />
                                        {form.password && <div className={`h-0.5 rounded-full ${strengthColors[strength]} ${strengthWidths[strength]}`} />}
                                    </div>
                                    <Input
                                        label="CONFIRM"
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Repeat"
                                        value={form.confirmPassword}
                                        onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                        error={errors.confirmPassword}
                                        className="!gap-1"
                                        inputClassName="!h-10 !px-3 !text-[11px]"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gold rounded-xl flex items-center justify-center gap-2 font-black text-midnight text-[11px] uppercase tracking-[0.2em] shadow-glow py-3.5 mt-2 active:scale-95 transition-transform disabled:opacity-50"
                            >
                                {loading ? 'Joining...' : 'Forge Identity'} <ArrowRight size={14} />
                            </button>
                        </form>

                        <div className="pt-2 border-t border-white/5 text-center">
                            <button onClick={() => onNavigate('login')} className="text-gold font-black uppercase tracking-widest text-[9px] hover:text-white transition-colors">
                                Sign In Instead
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 bg-black/60">
            <div className={`w-full max-w-5xl max-h-[90vh] bg-${THEME_PRIMARY} rounded-[3rem] shadow-2xl overflow-hidden flex relative animate-fade-in-up border border-white/10`}>
                {/* LaserFlow removed for desktop per request */}

                <button onClick={handleClose} className="absolute top-6 right-6 z-30 p-2.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-white/30 transition-all border border-white/10">
                    <X size={18} />
                </button>

                <div className="hidden md:flex w-5/12 relative overflow-hidden items-center justify-center group border-r border-white/5">
                    <div className="absolute inset-0 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-[2s]">
                        <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop" className="w-full h-full object-cover" />
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-t from-${THEME_PRIMARY} to-transparent`}></div>
                    <div className="relative z-10 p-12 text-white h-full flex flex-col justify-end">
                        <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center mb-6 shadow-glow -rotate-6">
                            <span className="text-xl font-black text-midnight">S</span>
                        </div>
                        <h2 className="font-playfair text-4xl font-black mb-4 leading-none tracking-tighter text-white">Join <br /><span className="text-gold italic underline underline-offset-8 decoration-gold/30">StyleSwap</span></h2>

                    </div>
                </div>

                <div className="w-full md:w-7/12 p-10 lg:p-14 flex flex-col justify-center relative z-20 overflow-y-auto custom-scrollbar">
                    <div className="mb-6">
                        <h1 className="font-playfair text-3xl font-black text-white mb-1 leading-none">Create Account</h1>
                        <p className="text-gray-500 font-medium tracking-tight text-sm">Become part of the StyleSwap Community.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="grid grid-cols-2 gap-5">
                            <Input
                                label="NAME"
                                placeholder="Your full name"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                error={errors.name}
                                icon={User}
                                inputClassName="h-11 text-sm"
                            />
                            <Input
                                label="EMAIL"
                                placeholder="you@styleswap.com"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                error={errors.email}
                                icon={Mail}
                                inputClassName="h-11 text-sm"
                            />
                        </div>

                        <div className="p-1 bg-white/5 rounded-2xl border border-white/5 flex gap-1">
                            <button type="button" onClick={() => setForm(f => ({ ...f, role: 'User', shopName: '' }))} className={`flex-1 py-3 rounded-xl transition-all font-black text-[10px] tracking-widest ${form.role === 'User' ? 'bg-gold text-midnight shadow-lg' : 'bg-transparent text-gray-500 hover:text-white'}`}>
                                RENT [ You are Buyer ]
                            </button>
                            <button type="button" onClick={() => setForm(f => ({ ...f, role: 'Sub-Admin' }))} className={`flex-1 py-3 rounded-xl transition-all font-black text-[10px] tracking-widest ${form.role === 'Sub-Admin' ? 'bg-gold text-midnight shadow-lg' : 'bg-transparent text-gray-500 hover:text-white'}`}>
                                LEND [ You are Seller ]
                            </button>
                        </div>

                        {form.role === 'Sub-Admin' && (
                            <div className="animate-fade-in-up">
                                <Input
                                    label="SHOP NAME"
                                    placeholder="e.g. Elegance Studio"
                                    value={form.shopName}
                                    onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
                                    error={errors.shopName}
                                    icon={Store}
                                    inputClassName="!text-gold h-11 text-sm font-bold"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <Input
                                    label="PASSWORD"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min 6 chars"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    error={errors.password}
                                    icon={Lock}
                                    iconRight={showPassword ? EyeOff : Eye}
                                    onIconRightClick={() => setShowPassword(v => !v)}
                                    inputClassName="h-11 text-sm"
                                />
                                {form.password && <div className={`h-0.5 rounded-full transition-all duration-500 ${strengthColors[strength]} ${strengthWidths[strength]}`} />}
                            </div>
                            <Input
                                label="CONFIRM"
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="Re-enter"
                                value={form.confirmPassword}
                                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                error={errors.confirmPassword}
                                icon={Lock}
                                inputClassName="h-11 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-14 rounded-xl bg-gold text-midnight text-[13px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-gold/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? 'Creating Identity...' : 'Join StyleSwap'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <p className="mt-8 text-center text-[9px] font-black text-gray-500 uppercase tracking-widest border-t border-white/5 pt-8">
                        Already have Account ?{' '}
                        <button onClick={() => onNavigate('login')} className="text-gold ml-1.5 underline underline-offset-4 decoration-gold/30 hover:decoration-gold transition-all">
                            SIGN IN
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
