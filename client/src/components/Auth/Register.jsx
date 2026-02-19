import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Store, X, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import { checkPasswordStrength } from '../../utils/helpers';

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

    // Handle Closing
    const handleClose = () => {
        if (onClose) onClose();
        else if (onNavigate) onNavigate('catalog');
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
        if (!form.password) errs.password = 'Password is required';
        else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
        if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
        else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        if (form.role === 'Sub-Admin' && !form.shopName.trim()) errs.shopName = 'Shop name is required for vendors';
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
            setAuthError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const strength = checkPasswordStrength(form.password);
    const strengthColors = { weak: 'bg-red-400', medium: 'bg-yellow-400', strong: 'bg-green-400' };
    const strengthWidths = { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
                <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full mx-4 animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h2 className="font-playfair text-3xl font-bold text-midnight mb-2">Welcome!</h2>
                    <p className="text-gray-500 mb-6">Your account has been created successfully.</p>
                    <div className="w-8 h-8 border-4 border-midnight border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 bg-black/20 overflow-y-auto">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-fade-in-up my-auto">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full text-midnight/60 hover:text-red-600 transition-all backdrop-blur-sm"
                >
                    <X size={20} />
                </button>

                {/* Left Side - Image (Order swapped on mobile for variety?) - Here sticking to left image */}
                <div className="hidden md:flex w-5/12 bg-midnight relative overflow-hidden items-center justify-center">
                    <div className="absolute inset-0 opacity-70">
                        <img
                            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop"
                            alt="Fashion Register"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 to-transparent"></div>
                    <div className="relative z-10 p-10 text-white h-full flex flex-col justify-end pb-20">
                        <h2 className="font-playfair text-4xl font-bold mb-4">Join the<br />Revolution</h2>
                        <ul className="space-y-4 text-blue-100/90 text-sm">
                            <li className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold">✓</span>
                                Access exclusive luxury collections
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold">✓</span>
                                Secure and insured rentals
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold">✓</span>
                                Doorstep delivery & pickup
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-7/12 p-8 md:p-12 bg-white max-h-[90vh] overflow-y-auto">
                    <div className="mb-6 text-center md:text-left">
                        <h1 className="font-playfair text-3xl font-bold text-midnight mb-1">Create Account</h1>
                        <p className="text-gray-500 text-sm">Start your style journey with us today.</p>
                    </div>

                    {authError && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg flex items-start gap-3">
                            <div className="mt-0.5"><X size={16} /></div>
                            <p>{authError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                type="text"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                error={errors.name}
                                icon={User}
                                required
                            />
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
                        </div>

                        {/* Role Selection */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <label className="text-sm font-semibold text-midnight block mb-3">I want to...</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 relative cursor-pointer border rounded-xl p-3 transition-all ${form.role === 'User' ? 'border-midnight bg-white shadow-sm ring-1 ring-midnight' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="role" value="User" className="sr-only"
                                        checked={form.role === 'User'}
                                        onChange={() => setForm(f => ({ ...f, role: 'User', shopName: '' }))} />
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.role === 'User' ? 'border-midnight' : 'border-gray-300'}`}>
                                            {form.role === 'User' && <div className="w-2 h-2 rounded-full bg-midnight"></div>}
                                        </div>
                                        <span className="font-bold text-sm text-midnight">Rent Styles</span>
                                    </div>
                                    <p className="text-xs text-gray-500 pl-6">Browse & rent items</p>
                                </label>

                                <label className={`flex-1 relative cursor-pointer border rounded-xl p-3 transition-all ${form.role === 'Sub-Admin' ? 'border-midnight bg-white shadow-sm ring-1 ring-midnight' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="role" value="Sub-Admin" className="sr-only"
                                        checked={form.role === 'Sub-Admin'}
                                        onChange={() => setForm(f => ({ ...f, role: 'Sub-Admin' }))} />
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.role === 'Sub-Admin' ? 'border-midnight' : 'border-gray-300'}`}>
                                            {form.role === 'Sub-Admin' && <div className="w-2 h-2 rounded-full bg-midnight"></div>}
                                        </div>
                                        <span className="font-bold text-sm text-midnight">List Items</span>
                                    </div>
                                    <p className="text-xs text-gray-500 pl-6">Earn by lending</p>
                                </label>
                            </div>
                        </div>

                        {/* Shop Name (Sub-Admin only) */}
                        {form.role === 'Sub-Admin' && (
                            <div className="animate-fade-in-up">
                                <Input
                                    label="Shop Name"
                                    type="text"
                                    placeholder="e.g. Elegance Rentals"
                                    value={form.shopName}
                                    onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
                                    error={errors.shopName}
                                    icon={Store}
                                    required
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 6 characters"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    error={errors.password}
                                    icon={Lock}
                                    iconRight={showPassword ? EyeOff : Eye}
                                    onIconRightClick={() => setShowPassword(v => !v)}
                                    required
                                />
                                {/* Password strength */}
                                {form.password && (
                                    <div className="mt-2 space-y-1">
                                        <div className="flex gap-1 h-1">
                                            <div className={`rounded-full transition-all duration-300 ${strengthColors[strength]} ${strengthWidths[strength]}`} style={{ height: '100%' }} />
                                        </div>
                                        <p className="text-[10px] text-gray-400 text-right capitalize">{strength}</p>
                                    </div>
                                )}
                            </div>

                            <Input
                                label="Confirm Password"
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="Re-enter password"
                                value={form.confirmPassword}
                                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                error={errors.confirmPassword}
                                icon={Lock}
                                iconRight={showConfirm ? EyeOff : Eye}
                                onIconRightClick={() => setShowConfirm(v => !v)}
                                required
                            />
                        </div>

                        <Button type="submit" fullWidth loading={loading} disabled={loading} className="py-3 text-base mt-2 shadow-lg shadow-blue-900/10">
                            {loading ? 'Creating Account...' : 'Create My Account'} <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </form>

                    <div className="mt-6 text-center border-t border-gray-100 pt-6">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                onClick={() => onNavigate('login')}
                                className="text-midnight font-bold hover:text-gold transition-colors underline decoration-gold/30 hover:decoration-gold"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
