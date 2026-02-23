import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, X, ArrowRight, CheckCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { api } from '../../utils/api';
import Input from '../Shared/Input';
import LaserFlow from './LaserFlow';

export default function ForgotPassword({ onNavigate, onClose }) {
    const [step, setStep] = useState('verify'); // 'verify' | 'reset' | 'success'
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleClose = () => {
        if (onClose) onClose();
        else if (onNavigate) onNavigate('login');
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        if (!email.trim()) { setError('Email is required'); return; }
        setError('');
        setLoading(true);
        try {
            await api.auth.forgotPassword(email);
            setStep('reset');
        } catch (err) {
            setError(err.message || 'No account found with this email');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) { setError('Min 6 characters'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
        setError('');
        setLoading(true);
        try {
            await api.auth.resetPassword(email, newPassword);
            setStep('success');
            setTimeout(() => {
                onNavigate('login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    const THEME_PRIMARY = "midnight-deep";
    const ACCENT_GOLD = "#D4AF37";
    const ACCENT_INDIGO = "#1E293B";

    const Header = () => (
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
    );

    if (step === 'success') {
        return (
            <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-${THEME_PRIMARY} flex flex-col overflow-hidden animate-fade-in`}>
                {isMobile && <LaserFlow color1="#10B981" color2={ACCENT_GOLD} />}
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 text-center max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                            <CheckCircle size={32} className="text-green-400" />
                        </div>
                        <h2 className="font-playfair text-3xl font-black text-white mb-2 leading-none">Security<br /><span className="text-gold italic">Restored</span></h2>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Password Changed Successfully</p>
                        <p className="text-gold text-[9px] mt-6 animate-pulse uppercase tracking-[0.2em] font-black">Redirecting to Login...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isMobile) {
        return (
            <div className={`fixed inset-0 z-[60] bg-${THEME_PRIMARY} flex flex-col overflow-hidden animate-fade-in h-screen`}>
                <LaserFlow color1={ACCENT_GOLD} color2={ACCENT_INDIGO} />
                <Header />

                <div className="relative z-20 flex-1 flex flex-col justify-center px-6 pb-6">
                    <div className="mb-6 px-2 text-center">
                        <span className="text-gold text-[8px] font-black uppercase tracking-[0.3em] block mb-1">Identity Recovery</span>
                        <h1 className="font-playfair text-3xl font-black text-white leading-none tracking-tighter">
                            {step === 'verify' ? 'Secure Verification' : 'New Credentials'}
                        </h1>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-7 shadow-2xl flex flex-col gap-6">
                        {error && (
                            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold text-center">
                                {error}
                            </div>
                        )}

                        {step === 'verify' ? (
                            <form onSubmit={handleVerifyEmail} className="flex flex-col gap-6">
                                <p className="text-gray-400 text-[11px] text-center px-4">
                                    Enter your registered email to verify your identity.
                                </p>
                                <Input
                                    label="EMAIL ADDRESS"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    icon={Mail}
                                    inputClassName="h-12 text-sm"
                                />
                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 bg-gold rounded-xl flex items-center justify-center gap-3 font-black text-midnight text-[11px] uppercase tracking-[0.2em] shadow-glow active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Verifying...' : 'Verify Email'} <ArrowRight size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onNavigate('login')}
                                        className="text-gray-500 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 py-2"
                                    >
                                        <ArrowLeft size={12} /> Back to Login
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
                                <div className="space-y-4">
                                    <Input
                                        label="NEW PASSWORD"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Min 6 characters"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        icon={Lock}
                                        iconRight={showPassword ? EyeOff : Eye}
                                        onIconRightClick={() => setShowPassword(v => !v)}
                                        inputClassName="h-12 text-sm"
                                    />
                                    <Input
                                        label="CONFIRM NEW PASSWORD"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Repeat new password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        icon={Lock}
                                        inputClassName="h-12 text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-gold rounded-xl flex items-center justify-center gap-3 font-black text-midnight text-[11px] uppercase tracking-[0.2em] shadow-glow active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Password'} <ArrowRight size={18} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Desktop
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 bg-black/60 font-sans">
            <div className={`w-full max-w-xl bg-${THEME_PRIMARY} rounded-[3rem] shadow-2xl overflow-hidden relative animate-fade-in-up border border-white/10 p-1`}>
                {/* LaserFlow removed for desktop per request */}

                <div className="relative z-20 p-10 lg:p-14">
                    <button onClick={handleClose} className="absolute top-8 right-8 z-30 p-2.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-white/30 transition-all border border-white/10">
                        <X size={18} />
                    </button>

                    <div className="mb-10 text-center">
                        <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow rotate-2">
                            <span className="text-xl font-black text-midnight">S</span>
                        </div>
                        <h1 className="font-playfair text-4xl font-black text-white mb-2 leading-none uppercase tracking-tighter">
                            {step === 'verify' ? 'Verify Identity' : 'Reset Password'}
                        </h1>
                        <p className="text-gray-500 font-medium tracking-tight text-sm">
                            {step === 'verify' ? 'Secure your elite credentials.' : 'Choose a new master password.'}
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center animate-shake">
                                {error}
                            </div>
                        )}

                        {step === 'verify' ? (
                            <form onSubmit={handleVerifyEmail} className="flex flex-col gap-6">
                                <Input
                                    label="EMAIL ADDRESS"
                                    placeholder="you@elite.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    icon={Mail}
                                    inputClassName="h-14 text-base"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="h-14 rounded-xl bg-gold text-midnight text-[13px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-gold/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? 'Searching Sanctuary...' : 'Proceed to Reset'} <ArrowRight size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onNavigate('login')}
                                    className="text-[10px] text-gray-500 font-black uppercase tracking-widest hover:text-gold transition-colors flex items-center justify-center gap-2"
                                >
                                    Return to Login
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
                                <div className="space-y-4">
                                    <Input
                                        label="NEW PASSWORD"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Min 6 chars"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        icon={Lock}
                                        iconRight={showPassword ? EyeOff : Eye}
                                        onIconRightClick={() => setShowPassword(v => !v)}
                                        inputClassName="h-14 text-base"
                                    />
                                    <Input
                                        label="CONFIRM PASSWORD"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Match new password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        icon={Lock}
                                        inputClassName="h-14 text-base"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="h-14 rounded-xl bg-gold text-midnight text-[13px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-gold/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? 'Updating Identity...' : 'Confirm Reset'} <ArrowRight size={18} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
