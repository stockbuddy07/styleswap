import React, { useState } from 'react';
import {
    User, Mail, Lock, Store, Globe, MapPin,
    Phone, CreditCard, Shield, Save, Bell,
    ChevronRight, Camera, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../Shared/Button';
import Input from '../Shared/Input';

export default function AdminSettings() {
    const { currentUser, updateCurrentUser, isAdmin, isSubAdmin } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('account');

    const [form, setForm] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        password: '',
        confirmPassword: '',
        shopName: currentUser?.shopName || '',
        shopAddress: currentUser?.shopAddress || '',
        shopNumber: currentUser?.shopNumber || '',
        mobileNumber: currentUser?.mobileNumber || '',
        salesHandlerMobile: currentUser?.salesHandlerMobile || '',
        gstNumber: currentUser?.gstNumber || '',
        shopDescription: currentUser?.shopDescription || ''
    });

    const [platformSettings, setPlatformSettings] = useState({
        maintenanceMode: false,
        commissionRate: 15
    });

    React.useEffect(() => {
        if (isAdmin) {
            import('../../utils/api').then(({ api }) => {
                api.settings.get().then(setPlatformSettings).catch(console.error);
            });
        }
    }, [isAdmin]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (form.password && form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // Update User Profile
            const updateData = { ...form };
            delete updateData.confirmPassword;
            if (!updateData.password) delete updateData.password;

            await updateCurrentUser(updateData);

            // Update Platform Settings (Admin Only)
            if (isAdmin && activeTab === 'platform') {
                const { api } = await import('../../utils/api');
                await api.settings.update(platformSettings);
            }

            toast.success('Settings updated successfully');
            setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            toast.error(err.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'account', label: 'Account', icon: User },
        ...(isSubAdmin ? [{ id: 'shop', label: 'Shop Profile', icon: Store }] : []),
        ...(isAdmin ? [{ id: 'platform', label: 'Platform', icon: Globe }] : []),
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const inputClass = "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/20";

    return (
        <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight-deep to-midnight p-6 text-white font-sans">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10 animate-luxury-entry stagger-1">
                    <div className="space-y-2">
                        <h1 className="font-playfair text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tighter">System Console</h1>
                        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Governance · Account · Infrastructure</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 space-y-3 animate-luxury-entry stagger-2">
                        {tabs.map((tab, i) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-500 group border ${activeTab === tab.id
                                    ? 'bg-gold text-midnight border-gold shadow-glow scale-[1.02]'
                                    : 'text-gray-500 border-white/5 hover:border-gold/30 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={18} className={activeTab === tab.id ? 'stroke-[3]' : 'stroke-[2]'} />
                                {tab.label}
                                <ChevronRight size={14} className={`ml-auto transition-all duration-500 ${activeTab === tab.id ? 'rotate-90 scale-125' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3 animate-luxury-entry stagger-3">
                        <div className="bg-midnight/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden">
                            {/* Decorative Glow */}
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

                            <form onSubmit={handleSave} className="space-y-10 relative z-10">

                                {activeTab === 'account' && (
                                    <div className="space-y-8 animate-luxury-entry">
                                        <div className="flex items-center gap-8 pb-10 border-b border-white/5">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-[2rem] bg-midnight-accent border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-700 group-hover:border-gold/50 group-hover:scale-105">
                                                    {currentUser?.avatar ? (
                                                        <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={40} className="text-gray-600 group-hover:text-gold transition-colors" />
                                                    )}
                                                </div>
                                                <button type="button" className="absolute -bottom-2 -right-2 p-3 bg-gold text-midnight rounded-xl shadow-glow hover:scale-110 active:scale-95 transition-all">
                                                    <Camera size={16} strokeWidth={3} />
                                                </button>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-playfair text-3xl font-black text-white tracking-tight">{currentUser?.name}</h3>
                                                <p className="text-gray-500 font-bold text-sm tracking-wide">{currentUser?.email}</p>
                                                <div className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-gold bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20 inline-block">
                                                    {currentUser?.role || 'Verified Personnel'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Full Name"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                inputClassName={inputClass}
                                            />
                                            <Input
                                                label="Email Address"
                                                type="email"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                inputClassName={inputClass}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'shop' && isSubAdmin && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex items-center gap-2 mb-4 text-gold">
                                            <Store size={20} />
                                            <h3 className="font-bold">Store Presentation</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Shop Name"
                                                value={form.shopName}
                                                onChange={e => setForm({ ...form, shopName: e.target.value })}
                                                inputClassName={inputClass}
                                            />
                                            <Input
                                                label="GST Number"
                                                value={form.gstNumber}
                                                onChange={e => setForm({ ...form, gstNumber: e.target.value })}
                                                inputClassName={inputClass}
                                                placeholder="Optional"
                                            />
                                            <div className="md:col-span-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Shop Description</label>
                                                <textarea
                                                    value={form.shopDescription}
                                                    onChange={e => setForm({ ...form, shopDescription: e.target.value })}
                                                    className={`w-full ${inputClass} rounded-xl px-4 py-3 text-sm min-h-[100px] outline-none transition-all`}
                                                    placeholder="Describe your boutique style..."
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5">
                                            <div className="flex items-center gap-2 mb-4 text-gold">
                                                <MapPin size={20} />
                                                <h3 className="font-bold">Contact & Location</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input
                                                    label="Shop Address"
                                                    value={form.shopAddress}
                                                    onChange={e => setForm({ ...form, shopAddress: e.target.value })}
                                                    inputClassName={inputClass}
                                                />
                                                <Input
                                                    label="Shop Phone"
                                                    value={form.shopNumber}
                                                    onChange={e => setForm({ ...form, shopNumber: e.target.value })}
                                                    inputClassName={inputClass}
                                                />
                                                <Input
                                                    label="Personal Mobile"
                                                    value={form.mobileNumber}
                                                    onChange={e => setForm({ ...form, mobileNumber: e.target.value })}
                                                    inputClassName={inputClass}
                                                />
                                                <Input
                                                    label="Sales Handler Mobile"
                                                    value={form.salesHandlerMobile}
                                                    onChange={e => setForm({ ...form, salesHandlerMobile: e.target.value })}
                                                    inputClassName={inputClass}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'platform' && isAdmin && (
                                    <div className="space-y-10 animate-luxury-entry">
                                        <div className="p-8 bg-gold/5 border border-gold/10 rounded-[2.5rem] relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                            <h3 className="text-gold font-black text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-3 relative z-10">
                                                <div className="p-2 bg-gold/10 rounded-lg"><Shield size={18} /></div> Governance Protocol
                                            </h3>
                                            <div className="space-y-8 relative z-10">
                                                <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all">
                                                    <div>
                                                        <p className="font-black text-white text-sm uppercase tracking-widest">Maintenance Sovereignty</p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Suspend public storefront access</p>
                                                    </div>
                                                    <div
                                                        onClick={() => setPlatformSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                                                        className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-500 ${platformSettings.maintenanceMode ? 'bg-gold shadow-glow' : 'bg-white/10'}`}
                                                    >
                                                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-2xl transition-all duration-500 ${platformSettings.maintenanceMode ? 'right-1 scale-110' : 'left-1'}`}></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all">
                                                    <div>
                                                        <p className="font-black text-white text-sm uppercase tracking-widest">Capital Yield Distribution</p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Global platform commission percentage</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="50"
                                                            value={platformSettings.commissionRate}
                                                            onChange={e => setPlatformSettings(prev => ({ ...prev, commissionRate: parseInt(e.target.value) }))}
                                                            className="w-32 accent-gold cursor-pointer"
                                                        />
                                                        <span className="text-gold font-black text-xl italic tracking-tighter w-12 text-right">{platformSettings.commissionRate}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-gold/20 transition-all duration-500 group">
                                                <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.3em] mb-2 group-hover:text-gold transition-colors">Infrastructure node</p>
                                                <p className="font-black text-white text-lg tracking-tight">Asia Pacific Cluster (Mumbai)</p>
                                            </div>
                                            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-gold/20 transition-all duration-500 group">
                                                <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.3em] mb-2 group-hover:text-gold transition-colors">Core Engine Version</p>
                                                <p className="font-black text-white text-lg tracking-tight">v2.5.0-LUXURY_ELITE</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" variant="primary" size="lg" loading={loading} className="shadow-glow px-10">
                                                <Save size={20} className="mr-2 stroke-[3]" /> Commit Infrastructure Changes
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'security' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex items-center gap-2 mb-4 text-gold">
                                            <Lock size={20} />
                                            <h3 className="font-bold">Password Management</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="New Password"
                                                type="password"
                                                value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })}
                                                inputClassName={inputClass}
                                                placeholder="Minimum 6 characters"
                                            />
                                            <Input
                                                label="Confirm New Password"
                                                type="password"
                                                value={form.confirmPassword}
                                                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                                inputClassName={inputClass}
                                            />
                                        </div>
                                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs">
                                            <p className="font-bold mb-1 flex items-center gap-1.5"><Shield size={14} /> Security Tip</p>
                                            Use a combination of uppercase, numbers, and symbols for a stronger platform account.
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div className="space-y-6 animate-fade-in py-10 text-center opacity-50">
                                        <Bell size={48} className="mx-auto mb-4 text-gray-500" />
                                        <h3 className="font-playfair text-xl font-bold">Notification Prefrences</h3>
                                        <p className="text-sm max-w-xs mx-auto">Fine-grained alert controls for new orders and system updates are coming in the next update.</p>
                                    </div>
                                )}

                                {/* Form Actions */}
                                {['account', 'shop', 'security'].includes(activeTab) && (
                                    <div className="pt-10 border-t border-white/5 flex justify-end">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            loading={loading}
                                            className="px-12 shadow-glow"
                                        >
                                            <Save size={20} className="mr-2 stroke-[3]" /> Commit Changes
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
