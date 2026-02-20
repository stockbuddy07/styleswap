import React, { useState } from 'react';
import {
    User, Mail, Phone, MapPin, Camera, Save,
    ArrowLeft, CheckCircle, Package, Heart, Star,
    CreditCard, Settings, ChevronRight, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../Shared/Button';
import { DEFAULT_IMAGE } from '../../utils/helpers';

export default function ProfileDashboard() {
    const { currentUser, updateCurrentUser, logout } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    const [form, setForm] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        address: currentUser?.address || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (form.password && form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const updateData = {
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                ...(form.password ? { password: form.password } : {})
            };

            await updateCurrentUser(updateData);
            toast.success('Profile updated successfully');

            // Clear password fields on success
            setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const navItems = [
        { id: 'details', label: 'Personal Details', icon: User },
        { id: 'orders', label: 'Order History', icon: Package },
        { id: 'wishlist', label: 'My Collection', icon: Heart },
        { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-6">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-playfair text-4xl font-bold text-midnight tracking-tight">My Account</h1>
                        <p className="text-gray-500 mt-2 font-medium">Manage your personal information and orders.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors font-bold text-sm uppercase tracking-wider self-start md:self-auto"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Sidebar / Profile Card */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Profile Summary Card */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-midnight to-blue-900 z-0 opacity-100"></div>

                            <div className="relative z-10 pt-10">
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-2xl mx-auto">
                                        {currentUser?.avatar ? (
                                            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-playfair text-4xl text-gray-300 font-bold">
                                                {currentUser?.name?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <button className="absolute bottom-1 right-1 p-2.5 bg-gold text-midnight rounded-full shadow-lg hover:scale-110 transition-transform ring-4 ring-white">
                                        <Camera size={16} />
                                    </button>
                                </div>

                                <h2 className="mt-6 font-playfair font-bold text-2xl text-midnight">{currentUser?.name}</h2>
                                <p className="text-gray-400 text-sm font-medium tracking-wide uppercase mt-1">{currentUser?.role || 'Member'}</p>

                                <div className="mt-8 flex items-center justify-center gap-3">
                                    <div className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-green-100">
                                        <CheckCircle size={12} /> Verified
                                    </div>
                                    <div className="px-4 py-1.5 bg-gold/10 text-gold rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-gold/20">
                                        <Star size={12} /> Pro Member
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${activeTab === item.id ? 'bg-midnight text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 hover:text-midnight'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} className={activeTab === item.id ? 'text-gold' : 'text-gray-400 group-hover:text-midnight'} />
                                        <span className="font-bold text-sm tracking-wide">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className={`transition-transform ${activeTab === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 min-h-[600px]">
                            {activeTab === 'details' && (
                                <div className="space-y-10 animate-fade-in-up">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                                        <div>
                                            <h2 className="font-playfair text-2xl font-bold text-midnight">Personal Details</h2>
                                            <p className="text-gray-400 text-sm mt-1">Update your personal information</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                        <div className="flex flex-col gap-2 group">
                                            <label className="text-xs font-black uppercase text-gray-400 tracking-wider group-focus-within:text-midnight transition-colors">Full Name</label>
                                            <div className="relative">
                                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gold transition-colors" />
                                                <input
                                                    type="text"
                                                    value={form.name}
                                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 pl-12 py-4 text-sm font-bold text-midnight focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all outline-none"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 group">
                                            <label className="text-xs font-black uppercase text-gray-400 tracking-wider group-focus-within:text-midnight transition-colors">Email Address</label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gold transition-colors" />
                                                <input
                                                    type="email"
                                                    value={form.email}
                                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 pl-12 py-4 text-sm font-bold text-midnight focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all outline-none"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 group">
                                            <label className="text-xs font-black uppercase text-gray-400 tracking-wider group-focus-within:text-midnight transition-colors">Phone Number</label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gold transition-colors" />
                                                <input
                                                    type="tel"
                                                    value={form.phone}
                                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 pl-12 py-4 text-sm font-bold text-midnight focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all outline-none"
                                                    placeholder="+91"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 group">
                                            <label className="text-xs font-black uppercase text-gray-400 tracking-wider group-focus-within:text-midnight transition-colors">Location</label>
                                            <div className="relative">
                                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gold transition-colors" />
                                                <input
                                                    type="text"
                                                    value={form.address}
                                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 pl-12 py-4 text-sm font-bold text-midnight focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all outline-none"
                                                    placeholder="City, Country"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                                            <h3 className="font-playfair text-lg font-bold text-midnight mb-4">Change Password</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="flex flex-col gap-2 group">
                                                    <label className="text-xs font-black uppercase text-gray-400 tracking-wider group-focus-within:text-midnight transition-colors">New Password</label>
                                                    <input
                                                        type="password"
                                                        value={form.password || ''}
                                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-4 text-sm font-bold text-midnight focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all outline-none"
                                                        placeholder="Leave blank to keep current"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2 group">
                                                    <label className="text-xs font-black uppercase text-gray-400 tracking-wider group-focus-within:text-midnight transition-colors">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        value={form.confirmPassword || ''}
                                                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-4 text-sm font-bold text-midnight focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all outline-none"
                                                        placeholder="Re-enter new password"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 pt-4 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-midnight text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gold hover:text-midnight transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 flex items-center gap-2"
                                            >
                                                {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab !== 'details' && (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-20 animate-fade-in-up">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                        <Settings size={40} className="text-gray-300" />
                                    </div>
                                    <h3 className="font-playfair text-2xl font-bold text-midnight">Coming Soon</h3>
                                    <p className="text-gray-400 mt-2 max-w-xs mx-auto">This section is currently being curated for your executive experience.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
