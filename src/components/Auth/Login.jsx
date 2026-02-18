import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
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

    const quickLogin = (email, password) => {
        setForm({ email, password });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 transition-all duration-300">
            <div className="w-full max-w-md relative">
                {/* Card */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-8 relative">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-midnight/60 hover:text-red-600 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="text-center mb-8">
                        <h1 className="font-playfair text-3xl font-bold text-midnight drop-shadow-sm">Welcome Back</h1>
                        <p className="text-midnight/70 text-sm mt-1">Enter your details to sign in</p>
                    </div>

                    {authError && (
                        <div className="mb-4 p-3 bg-red-50/90 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {authError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

                        <Button type="submit" fullWidth loading={loading} disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                            onClick={() => onNavigate('register')}
                            className="text-gold font-semibold hover:underline"
                        >
                            Create one
                        </button>
                    </p>
                </div>

                {/* Quick Login Demo Credentials */}
                <div className="mt-6 bg-white bg-opacity-10 rounded-xl p-4">
                    <p className="text-white text-xs font-semibold mb-3 text-center uppercase tracking-wider">Demo Credentials</p>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: '👑 Admin', email: 'admin@styleswap.com', password: 'admin123' },
                            { label: '🏪 Vendor 1', email: 'elegance@styleswap.com', password: 'vendor123' },
                            { label: '🏪 Vendor 2', email: 'formal@styleswap.com', password: 'vendor123' },
                            { label: '🛍️ Customer', email: 'customer@styleswap.com', password: 'user123' },
                        ].map(({ label, email, password }) => (
                            <button
                                key={email}
                                onClick={() => quickLogin(email, password)}
                                className="text-left p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all text-white text-xs"
                            >
                                <div className="font-semibold">{label}</div>
                                <div className="text-gray-300 truncate">{email}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
