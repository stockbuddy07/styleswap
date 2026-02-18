import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import Input from '../Shared/Input';
import { formatCurrency, getStockStatus } from '../../utils/helpers';

const CATEGORIES = ['Wedding Attire', 'Blazers', 'Shoes', 'Accessories'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '5', '6', '7', '8', '9', '10', '11', '12', 'One Size'];

function ProductFormModal({ isOpen, onClose, editProduct, onSave }) {
    const empty = { name: '', category: 'Wedding Attire', pricePerDay: '', securityDeposit: '', description: '', stockQuantity: '', sizes: [], images: [''] };
    const [form, setForm] = useState(editProduct || empty);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        setForm(editProduct ? { ...editProduct, images: editProduct.images?.length ? editProduct.images : [''] } : empty);
        setErrors({});
    }, [editProduct, isOpen]);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Required';
        if (!form.pricePerDay || Number(form.pricePerDay) <= 0) errs.pricePerDay = 'Must be > 0';
        if (form.securityDeposit === '' || Number(form.securityDeposit) < 0) errs.securityDeposit = 'Must be ≥ 0';
        if (!form.description.trim()) errs.description = 'Required';
        if (!form.stockQuantity || Number(form.stockQuantity) < 1) errs.stockQuantity = 'Must be ≥ 1';
        if (!form.sizes.length) errs.sizes = 'Select at least one size';
        if (!form.images.some(img => img.trim())) errs.images = 'At least one image URL required';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            await onSave({
                ...form,
                pricePerDay: Number(form.pricePerDay),
                securityDeposit: Number(form.securityDeposit),
                stockQuantity: Number(form.stockQuantity),
                images: form.images.filter(img => img.trim()),
            });
            onClose();
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setLoading(false);
        }
    };

    const toggleSize = (size) => {
        setForm(f => ({
            ...f,
            sizes: f.sizes.includes(size) ? f.sizes.filter(s => s !== size) : [...f.sizes, size],
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editProduct ? 'Edit Product' : 'Add New Product'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                {errors.submit && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{errors.submit}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Product Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} required />
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-darkGray">Category <span className="text-red-500">*</span></label>
                        <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <Input label="Description" type="textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} error={errors.description} required rows={3} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="Price Per Day ($)" type="number" min="1" value={form.pricePerDay} onChange={e => setForm(f => ({ ...f, pricePerDay: e.target.value }))} error={errors.pricePerDay} required />
                    <Input label="Security Deposit ($)" type="number" min="0" value={form.securityDeposit} onChange={e => setForm(f => ({ ...f, securityDeposit: e.target.value }))} error={errors.securityDeposit} required />
                    <Input label="Stock Quantity" type="number" min="1" value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} error={errors.stockQuantity} required />
                </div>

                {/* Sizes */}
                <div>
                    <label className="text-sm font-medium text-darkGray block mb-2">Sizes <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                        {ALL_SIZES.map(size => (
                            <button key={size} type="button" onClick={() => toggleSize(size)}
                                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${form.sizes.includes(size) ? 'bg-midnight text-white border-midnight' : 'border-gray-300 text-gray-600 hover:border-midnight'}`}>
                                {size}
                            </button>
                        ))}
                    </div>
                    {errors.sizes && <p className="text-red-500 text-xs mt-1">{errors.sizes}</p>}
                </div>

                {/* Image URLs */}
                <div>
                    <label className="text-sm font-medium text-darkGray block mb-2">Image URLs <span className="text-red-500">*</span></label>
                    <div className="space-y-2">
                        {form.images.map((img, i) => (
                            <div key={i} className="flex gap-2">
                                <input type="url" value={img} onChange={e => {
                                    const imgs = [...form.images];
                                    imgs[i] = e.target.value;
                                    setForm(f => ({ ...f, images: imgs }));
                                }} placeholder={`Image URL ${i + 1}`} className="input-field text-sm" />
                                {form.images.length > 1 && (
                                    <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm">✕</button>
                                )}
                            </div>
                        ))}
                        {form.images.length < 5 && (
                            <button type="button" onClick={() => setForm(f => ({ ...f, images: [...f.images, ''] }))}
                                className="text-sm text-gold hover:underline">+ Add another image</button>
                        )}
                    </div>
                    {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} fullWidth>Cancel</Button>
                    <Button type="submit" loading={loading} fullWidth>{editProduct ? 'Save Changes' : 'Add Product'}</Button>
                </div>
            </form>
        </Modal>
    );
}

function DeleteProductModal({ isOpen, onClose, product, onConfirm, activeRentalCount }) {
    const [loading, setLoading] = useState(false);
    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
        onClose();
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Product" size="sm">
            <div className="space-y-4">
                <p className="text-gray-600">Are you sure you want to delete <strong>{product?.name}</strong>?</p>
                {activeRentalCount > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        ⚠️ This product has <strong>{activeRentalCount}</strong> active rental(s). Deleting may affect ongoing orders.
                    </div>
                )}
                <p className="text-sm text-gray-400">This action cannot be undone.</p>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} fullWidth>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirm} loading={loading} fullWidth>Delete</Button>
                </div>
            </div>
        </Modal>
    );
}

const categoryColors = {
    'Wedding Attire': 'bg-pink-100 text-pink-800',
    'Blazers': 'bg-blue-100 text-blue-800',
    'Shoes': 'bg-orange-100 text-orange-800',
    'Accessories': 'bg-purple-100 text-purple-800',
};

export default function ProductManagement() {
    const { myProducts, createProduct, updateProduct, deleteProduct } = useProducts();
    const { vendorOrders } = useOrders();
    const toast = useToast();
    const { vendorProfileComplete } = useAuth();
    const [createOpen, setCreateOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const getActiveRentalCount = (productId) =>
        vendorOrders.filter(o => o.status === 'Active' && o.items.some(i => i.productId === productId)).length;

    const handleCreate = async (form) => {
        await createProduct(form);
        toast.success('Product added successfully!');
    };

    const handleEdit = async (form) => {
        await updateProduct(editProduct.id, form);
        toast.success('Product updated successfully!');
        setEditProduct(null);
    };

    const handleDelete = async () => {
        await deleteProduct(deleteTarget.id);
        toast.success('Product deleted successfully!');
        setDeleteTarget(null);
    };

    return (
        <div className="space-y-6">
            {/* Profile incomplete banner */}
            {!vendorProfileComplete && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-300 rounded-2xl">
                    <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-amber-800">Complete your shop profile to list products</p>
                        <p className="text-amber-700 text-sm mt-0.5">Your shop details are incomplete. Please finish your profile setup to start adding products.</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap">
                        Complete Profile <ArrowRight size={13} />
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-playfair text-2xl font-bold text-midnight">My Products</h1>
                    <p className="text-gray-500 text-sm mt-1">{myProducts.length} products in your shop</p>
                </div>
                <Button
                    onClick={() => vendorProfileComplete ? setCreateOpen(true) : null}
                    disabled={!vendorProfileComplete}
                    title={!vendorProfileComplete ? 'Complete your shop profile first' : ''}
                >
                    <Plus size={16} className="mr-2" /> Add Product
                </Button>
            </div>

            {myProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-16 text-center">
                    <Package size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="font-playfair text-xl font-semibold text-gray-500 mb-2">No products yet</h3>
                    <p className="text-gray-400 text-sm mb-6">Start adding products to your shop</p>
                    <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" /> Add First Product</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {myProducts.map(product => {
                        const stock = getStockStatus(product.availableQuantity);
                        return (
                            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative h-48">
                                    <img src={product.images?.[0]} alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={e => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }} />
                                    <span className={`absolute top-3 left-3 badge ${categoryColors[product.category] || 'bg-gray-100 text-gray-700'}`}>
                                        {product.category}
                                    </span>
                                    <span className={`absolute top-3 right-3 badge ${stock.color}`}>{stock.label}</span>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-midnight truncate">{product.name}</h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-gold font-bold text-lg">{formatCurrency(product.pricePerDay)}<span className="text-gray-400 text-xs font-normal">/day</span></span>
                                        <span className="text-gray-500 text-xs">{product.availableQuantity}/{product.stockQuantity} avail.</span>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button variant="outline" size="sm" fullWidth onClick={() => setEditProduct(product)}>
                                            <Edit2 size={14} className="mr-1" /> Edit
                                        </Button>
                                        <Button variant="danger" size="sm" fullWidth onClick={() => setDeleteTarget(product)}>
                                            <Trash2 size={14} className="mr-1" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ProductFormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} />
            <ProductFormModal isOpen={!!editProduct} onClose={() => setEditProduct(null)} editProduct={editProduct} onSave={handleEdit} />
            <DeleteProductModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} product={deleteTarget}
                onConfirm={handleDelete} activeRentalCount={deleteTarget ? getActiveRentalCount(deleteTarget.id) : 0} />
        </div>
    );
}
