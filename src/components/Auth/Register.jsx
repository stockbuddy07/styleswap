import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import { checkPasswordStrength } from '../../utils/helpers';

export default function Register({ onNavigate }) {
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
            // AuthContext.register now auto-logs in the user.
            // App.jsx will automatically route vendors to onboarding and users to catalog.
            await register(form.name, form.email, form.password, form.role, form.shopName || null);
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
            <div className="min-h-screen bg-gradient-to-br from-midnight via-blue-900 to-midnight flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="font-playfair text-2xl font-bold text-midnight mb-2">Account Created!</h2>
                    <p className="text-gray-600 text-sm">Redirecting you to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-midnight via-blue-900 to-midnight flex items-center justify-center p-4 py-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gold rounded-2xl mb-3 shadow-lg">
                        <span className="font-playfair font-bold text-midnight text-xl">S</span>
                    </div>
                    <h1 className="font-playfair text-2xl font-bold text-white">Join StyleSwap</h1>
                    <p className="text-gray-400 mt-1 text-sm">Create your account</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="font-playfair text-xl font-semibold text-midnight mb-5">Create Account</h2>

                    {authError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {authError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

                        {/* Role Selection */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-darkGray">
                                Account Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.role}
                                onChange={e => setForm(f => ({ ...f, role: e.target.value, shopName: '' }))}
                                className="input-field"
                            >
                                <option value="User">Customer — Browse & Rent</option>
                                <option value="Sub-Admin">Vendor — List Products</option>
                            </select>
                        </div>

                        {/* Shop Name (Sub-Admin only) */}
                        {form.role === 'Sub-Admin' && (
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
                        )}

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
                            <div className="space-y-1">
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-300 ${strengthColors[strength]} ${strengthWidths[strength]}`} />
                                </div>
                                <p className="text-xs text-gray-500 capitalize">Password strength: <span className="font-medium">{strength}</span></p>
                            </div>
                        )}

                        <Input
                            label="Confirm Password"
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Re-enter your password"
                            value={form.confirmPassword}
                            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                            error={errors.confirmPassword}
                            icon={Lock}
                            iconRight={showConfirm ? EyeOff : Eye}
                            onIconRightClick={() => setShowConfirm(v => !v)}
                            required
                        />

                        <Button type="submit" fullWidth loading={loading} disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <p className="mt-5 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={() => onNavigate('login')}
                            className="text-gold font-semibold hover:underline"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
