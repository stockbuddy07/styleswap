import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, User, Store } from 'lucide-react';
import { useUsers } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import Input from '../Shared/Input';
import { formatDate, validateEmail, generateId } from '../../utils/helpers';

const ROLES = ['Admin', 'Sub-Admin', 'User'];
const PER_PAGE = 10;

function UserFormModal({ isOpen, onClose, editUser, onSave }) {
    const [form, setForm] = useState(editUser || { name: '', email: '', password: '', role: 'User', shopName: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        setForm(editUser || { name: '', email: '', password: '', role: 'User', shopName: '' });
        setErrors({});
    }, [editUser, isOpen]);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Required';
        if (!form.email.trim()) errs.email = 'Required';
        else if (!validateEmail(form.email)) errs.email = 'Invalid email';
        if (!editUser && !form.password) errs.password = 'Required';
        if (!editUser && form.password && form.password.length < 6) errs.password = 'Min 6 chars';
        if (form.role === 'Sub-Admin' && !form.shopName.trim()) errs.shopName = 'Required for vendors';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            await onSave(form);
            onClose();
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setLoading(false);
        }
    };

    const darkInputClass = "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-gold focus:ring-gold/20";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editUser ? 'Edit User' : 'Add New User'}
            size="md"
            className="bg-midnight-deep/95 backdrop-blur-3xl border border-white/10 text-white rounded-[2.5rem] shadow-2xl"
            headerClassName="border-white/5 py-8 px-10"
        >
            <form onSubmit={handleSubmit} className="space-y-6 px-4 pb-4">
                {errors.submit && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{errors.submit}</div>}

                <Input
                    label="Full Name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    error={errors.name}
                    required
                    inputClassName={darkInputClass}
                />

                <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    error={errors.email}
                    required
                    inputClassName={darkInputClass}
                />

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-300">
                        {editUser ? 'New Password' : 'Password'} {editUser ? <span className="text-gray-500 font-normal">(Leave blank to keep unchanged)</span> : <span className="text-red-500">*</span>}
                    </label>
                    <Input
                        type="password"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        error={errors.password}
                        required={!editUser}
                        placeholder={editUser ? "Enter new password to reset" : "Enter password"}
                        inputClassName={darkInputClass}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-300">Role <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 min-h-[48px] appearance-none ${darkInputClass}`}
                            value={form.role}
                            onChange={e => setForm(f => ({ ...f, role: e.target.value, shopName: '' }))}
                        >
                            {ROLES.map(r => <option key={r} value={r} className="bg-midnight text-white">{r}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronRight size={16} className="rotate-90" />
                        </div>
                    </div>
                </div>

                {form.role === 'Sub-Admin' && (
                    <Input
                        label="Shop Name"
                        value={form.shopName || ''}
                        onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
                        error={errors.shopName}
                        required
                        inputClassName={darkInputClass}
                    />
                )}

                <div className="flex gap-3 pt-4">
                    <div className="w-1/2">
                        <Button type="button" variant="glass" onClick={onClose} fullWidth>Cancel</Button>
                    </div>
                    <div className="w-1/2">
                        <Button type="submit" variant="primary" loading={loading} fullWidth>{editUser ? 'Save Changes' : 'Create User'}</Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

function DeleteModal({ isOpen, onClose, user, onConfirm }) {
    const [loading, setLoading] = useState(false);
    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
        onClose();
    };
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete User"
            size="sm"
            className="bg-midnight/95 border border-white/10 text-white"
            headerClassName="border-white/10"
        >
            <div className="space-y-4">
                <p className="text-gray-300">Are you sure you want to delete <strong className="text-white">{user?.name}</strong>? This action cannot be undone.</p>
                <div className="flex gap-3">
                    <Button variant="glass" onClick={onClose} fullWidth>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirm} loading={loading} fullWidth>Delete</Button>
                </div>
            </div>
        </Modal>
    );
}

export default function UserManagement() {
    const { users, createUser, updateUser, deleteUser } = useUsers();
    const toast = useToast();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [createOpen, setCreateOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filtered = useMemo(() => {
        return users.filter(u => {
            const q = search.toLowerCase();
            const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
            const matchRole = roleFilter === 'All' || u.role === roleFilter;
            return matchSearch && matchRole;
        });
    }, [users, search, roleFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handleCreate = async (form) => {
        await createUser({ ...form, id: generateId(), createdAt: new Date().toISOString(), status: 'active', avatar: null });
        toast.success('User created successfully');
    };

    const handleEdit = async (form) => {
        await updateUser(editUser.id, form);
        toast.success('User updated successfully');
        setEditUser(null);
    };

    const handleDelete = async () => {
        await deleteUser(deleteTarget.id);
        toast.success('User deleted successfully');
        setDeleteTarget(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight-deep to-midnight p-6 text-white space-y-8 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-8 animate-luxury-entry stagger-1">
                <div className="space-y-2">
                    <h1 className="font-playfair text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tighter">User Management</h1>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-gold/20">
                            {users.length} Total Accounts
                        </span>
                        <div className="w-1 h-1 rounded-full bg-gray-700" />
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Access Control Center</p>
                    </div>
                </div>
                <Button onClick={() => setCreateOpen(true)} variant="primary" size="lg" className="shadow-glow whitespace-nowrap">
                    <Plus size={20} className="mr-2 stroke-[3]" /> Create New Account
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-midnight/40 backdrop-blur-2xl p-6 rounded-[2rem] shadow-2xl border border-white/5 animate-luxury-entry stagger-2">
                <div className="relative flex-1 group">
                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-all duration-300" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search for users..."
                        className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-gold/5 focus:border-gold/30 transition-all placeholder:text-gray-600 font-medium"
                    />
                </div>
                <div className="min-w-0 sm:min-w-[240px] relative">
                    <select
                        value={roleFilter}
                        onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-3.5 text-sm text-white focus:outline-none focus:ring-4 focus:ring-gold/5 focus:border-gold/30 transition-all cursor-pointer appearance-none font-bold uppercase tracking-widest text-[10px]"
                    >
                        <option value="All" className="bg-midnight font-bold">All Permissions</option>
                        {ROLES.map(r => <option key={r} value={r} className="bg-midnight font-bold">{r.toUpperCase()}</option>)}
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 rotate-90" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-midnight/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden animate-luxury-entry stagger-3">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">User Profile</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden md:table-cell">Privileges</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden lg:table-cell">Commerce</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden xl:table-cell">Registration</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-2">
                                                <User size={24} />
                                            </div>
                                            <p className="font-medium text-gray-300">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginated.map((user, i) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-all duration-500 group border-b border-white/5 last:border-0">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-playfair font-black text-xl shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-3 ${i % 3 === 0 ? 'bg-indigo-500/20 text-indigo-400' : i % 3 === 1 ? 'bg-gold/20 text-gold' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {user.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="font-bold text-white text-base group-hover:text-gold transition-colors">{user.name}</div>
                                                <div className="text-gray-500 text-xs font-medium">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 hidden md:table-cell">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-current transition-all group-hover:bg-current group-hover:text-midnight ${user.role === 'Admin' ? 'text-purple-400' :
                                            user.role === 'Sub-Admin' ? 'text-blue-400' :
                                                'text-emerald-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 hidden lg:table-cell">
                                        {user.shopName ? (
                                            <div className="flex items-center gap-2.5 text-gray-400">
                                                <div className="p-1 px-1.5 bg-gold/10 rounded">
                                                    <Store size={12} className="text-gold" />
                                                </div>
                                                <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">{user.shopName}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-700 font-bold uppercase text-[10px] tracking-widest">Standalone</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 hidden xl:table-cell">
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{formatDate(user.createdAt)}</p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => setEditUser(user)} className="p-2.5 rounded-xl bg-white/5 hover:bg-gold hover:text-midnight hover:shadow-glow text-gray-400 transition-all" title="Edit Domain Access">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => setDeleteTarget(user)} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] text-gray-400 transition-all" title="Revoke Access">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/5">
                        <span className="text-sm text-gray-500 font-medium">
                            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} users
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 disabled:opacity-30 disabled:hover:bg-transparent border border-transparent hover:border-white/10 transition-all">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 disabled:opacity-30 disabled:hover:bg-transparent border border-transparent hover:border-white/10 transition-all">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <UserFormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} />
            <UserFormModal isOpen={!!editUser} onClose={() => setEditUser(null)} editUser={editUser} onSave={handleEdit} />
            <DeleteModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} user={deleteTarget} onConfirm={handleDelete} />
        </div>
    );
}
