import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, X, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import LaserFlow from './LaserFlow';

export default function Login({ onNavigate, onClose }) {
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
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
        if (!form.email.trim()) errs.email = 'Required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid';
        if (!form.password) errs.password = 'Required';
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
            await login(form.email, form.password);
        } catch (err) {
            setAuthError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const THEME_PRIMARY = "midnight-deep";
    const ACCENT_GOLD = "#D4AF37";
    const ACCENT_INDIGO = "#1E293B";

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

                <div className="relative z-20 flex-1 flex flex-col justify-center px-6 pb-6 mt-[-20px]">
                    <div className="mb-6 px-2 text-center">
                        <h1 className="font-playfair text-4xl font-black text-white leading-none tracking-tighter">Welcome <span className="text-gold italic">Back</span></h1>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-7 shadow-2xl flex flex-col gap-6">
                        {authError && (
                            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold text-center">
                                {authError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="space-y-4">
                                <Input
                                    label="EMAIL ADDRESS"
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    error={errors.email}
                                    icon={Mail}
                                    inputClassName="h-12 text-sm"
                                />
                                <div className="space-y-1">
                                    <Input
                                        label="PASSWORD"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        error={errors.password}
                                        icon={Lock}
                                        iconRight={showPassword ? EyeOff : Eye}
                                        onIconRightClick={() => setShowPassword(v => !v)}
                                        inputClassName="h-12 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => onNavigate('forgot-password')}
                                        className="text-gold text-[9px] font-black uppercase tracking-widest block ml-auto pt-1"
                                    >
                                        Forgot?
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-gold rounded-xl flex items-center justify-center gap-3 font-black text-midnight text-[11px] uppercase tracking-[0.2em] shadow-glow active:scale-95 transition-all disabled:opacity-50 mt-2"
                            >
                                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="pt-4 border-t border-white/5 text-center">
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                New here? <button onClick={() => onNavigate('register')} className="text-gold ml-1">Join The Elite</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 bg-black/60">
            <div className={`w-full max-w-4xl max-h-[90vh] bg-${THEME_PRIMARY} rounded-[3rem] shadow-2xl overflow-hidden flex relative animate-fade-in-up border border-white/10`}>
                {/* LaserFlow removed for desktop per request */}

                <button onClick={handleClose} className="absolute top-6 right-6 z-30 p-2.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-white/30 transition-all border border-white/10">
                    <X size={18} />
                </button>

                <div className="hidden md:flex w-1/2 relative overflow-hidden items-center justify-center group border-r border-white/5">
                    <div className="absolute inset-0 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-[2s]">
                        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" />
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-t from-${THEME_PRIMARY} via-${THEME_PRIMARY}/80 to-transparent`}></div>
                    <div className="relative z-10 text-center p-12 text-white">
                        <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow rotate-2">
                            <span className="text-xl font-black text-midnight">S</span>
                        </div>
                        <h2 className="font-playfair text-4xl font-black mb-3 text-white">StyleSwap</h2>
                        <p className="text-gold/60 font-bold italic text-[9px] uppercase tracking-[0.4em]">DNA OF LUXURY</p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-10 lg:p-14 flex flex-col justify-center relative z-20">
                    <div className="mb-10">
                        <h1 className="font-playfair text-3xl font-black text-white mb-1.5 leading-none">Welcome Back</h1>
                        <p className="text-gray-500 font-medium tracking-tight text-sm">Access your Fanstatic collection.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <Input
                            label="EMAIL ADDRESS"
                            type="email"
                            placeholder="you@styleswap.com"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            error={errors.email}
                            icon={Mail}
                            inputClassName="h-12 text-sm"
                        />
                        <div className="space-y-2">
                            <Input
                                label="PASSWORD"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                error={errors.password}
                                icon={Lock}
                                iconRight={showPassword ? EyeOff : Eye}
                                onIconRightClick={() => setShowPassword(v => !v)}
                                inputClassName="h-12 text-sm"
                            />
                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={() => onNavigate('forgot-password')}
                                    className="text-[9px] text-gold font-black uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-14 rounded-xl bg-gold text-midnight text-[13px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-gold/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <p className="mt-12 text-center text-[9px] font-black text-gray-500 uppercase tracking-widest border-t border-white/5 pt-10">
                        New Member?{' '}
                        <button onClick={() => onNavigate('register')} className="text-gold ml-1.5 underline underline-offset-4 decoration-gold/30 hover:decoration-gold transition-all">
                            REGISTER NOW
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
