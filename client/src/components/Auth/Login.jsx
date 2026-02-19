import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../Shared/Button';
import Input from '../Shared/Input';

export default function Login({ onNavigate, onClose }) {
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    // Handle Closing
    const handleClose = () => {
        if (onClose) onClose();
        else if (onNavigate) onNavigate('catalog'); // Fallback
    };

    const validate = () => {
        const errs = {};
        if (!form.email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
        if (!form.password) errs.password = 'Password is required';
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
            // App.jsx will re-render based on auth state
        } catch (err) {
            setAuthError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 transition-all duration-300 bg-black/20">
            {/* Main Card */}
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-fade-in-up">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full text-midnight/60 hover:text-red-600 transition-all backdrop-blur-sm"
                >
                    <X size={20} />
                </button>

                {/* Left Side - Image/Brand */}
                <div className="hidden md:flex w-1/2 bg-midnight relative overflow-hidden items-center justify-center">
                    <div className="absolute inset-0 opacity-60">
                        <img
                            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                            alt="Fashion Background"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent"></div>
                    <div className="relative z-10 text-center p-10 text-white">
                        <h2 className="font-playfair text-4xl font-bold mb-4">StyleSwap</h2>
                        <p className="text-blue-100/80 font-light text-lg leading-relaxed">
                            "Fashion is the armor to survive the reality of everyday life."
                        </p>
                        <div className="mt-8 flex justify-center gap-2">
                            <div className="w-12 h-1 bg-gold rounded-full"></div>
                            <div className="w-3 h-1 bg-white/30 rounded-full"></div>
                            <div className="w-3 h-1 bg-white/30 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
                    <div className="mb-8">
                        <h1 className="font-playfair text-3xl font-bold text-midnight mb-2">Welcome Back</h1>
                        <p className="text-gray-500">Please enter your details to sign in.</p>
                    </div>

                    {authError && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg flex items-start gap-3 animate-shake">
                            <div className="mt-0.5"><X size={16} /></div>
                            <div>
                                <p className="font-semibold">Login Failed</p>
                                <p>{authError}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            error={errors.email}
                            icon={Mail}
                            required
                        />
                        <div>
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                error={errors.password}
                                icon={Lock}
                                iconRight={showPassword ? EyeOff : Eye}
                                onIconRightClick={() => setShowPassword(v => !v)}
                                required
                            />
                            <div className="flex justify-end mt-2">
                                <button type="button" className="text-xs text-gold hover:text-midnight transition-colors font-medium">
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        <Button type="submit" fullWidth loading={loading} disabled={loading} className="py-3 text-base shadow-lg shadow-blue-900/20">
                            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <button
                            onClick={() => onNavigate('register')}
                            className="text-midnight font-bold hover:text-gold transition-colors underline decoration-gold/30 hover:decoration-gold"
                        >
                            Create one now
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
