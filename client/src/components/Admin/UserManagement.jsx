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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editUser ? 'Edit User' : 'Add New User'} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                {errors.submit && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{errors.submit}</div>}
                <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} required />
                <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={errors.email} disabled={!!editUser} required />
                {!editUser && (
                    <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} error={errors.password} required />
                )}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-darkGray">Role <span className="text-red-500">*</span></label>
                    <select className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value, shopName: '' }))}>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                {form.role === 'Sub-Admin' && (
                    <Input label="Shop Name" value={form.shopName || ''} onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))} error={errors.shopName} required />
                )}
                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} fullWidth>Cancel</Button>
                    <Button type="submit" loading={loading} fullWidth>{editUser ? 'Save Changes' : 'Create User'}</Button>
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
        <Modal isOpen={isOpen} onClose={onClose} title="Delete User" size="sm">
            <div className="space-y-4">
                <p className="text-gray-600">Are you sure you want to delete <strong>{user?.name}</strong>? This action cannot be undone.</p>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} fullWidth>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirm} loading={loading} fullWidth>Delete</Button>
                </div>
            </div>
        </Modal>
    );
}

const roleColors = {
    Admin: 'bg-purple-100 text-purple-800',
    'Sub-Admin': 'bg-blue-100 text-blue-800',
    User: 'bg-green-100 text-green-800',
};

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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-playfair text-2xl font-bold text-midnight">User Management</h1>
                    <p className="text-gray-500 text-sm mt-1">{users.length} total users</p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus size={16} className="mr-2" /> Add User
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by name, email, or role..."
                        className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white"
                >
                    <option value="All">All Roles</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">User</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Role</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Shop</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Joined</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No users found</td></tr>
                            ) : paginated.map(user => (
                                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-midnight flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {user.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-midnight">{user.name}</div>
                                                <div className="text-gray-400 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className={`badge ${roleColors[user.role]}`}>{user.role}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600 text-xs">
                                        {user.shopName || '—'}
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setEditUser(user)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" aria-label="Edit user">
                                                <Edit2 size={15} />
                                            </button>
                                            <button onClick={() => setDeleteTarget(user)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" aria-label="Delete user">
                                                <Trash2 size={15} />
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
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                <ChevronRight size={16} />
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
