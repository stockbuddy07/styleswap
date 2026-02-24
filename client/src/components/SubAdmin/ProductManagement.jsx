import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, AlertTriangle, ArrowRight, UploadCloud, X, Star } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, DEFAULT_IMAGE } from '../../utils/helpers';
import { uploadImageFast } from '../../utils/supabaseUtility';
import Loader from '../Shared/Loader';

const CATEGORIES = ['Wedding Attire', 'Blazers', 'Shoes', 'Accessories'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '5', '6', '7', '8', '9', '10', '11', '12', 'One Size'];

const darkInputClass = "w-full bg-midnight-accent/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all placeholder:text-gray-600";
const darkLabelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block ml-1";

function ProductFormModal({ isOpen, onClose, editProduct, onSave }) {
    const empty = { name: '', category: '', pricePerDay: '', retailPrice: '', securityDeposit: '', description: '', stockQuantity: '', sizes: [], images: [''] };
    const [form, setForm] = useState(editProduct || empty);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const toast = useToast();

    React.useEffect(() => {
        setForm(editProduct ? { ...editProduct, images: editProduct.images?.length ? editProduct.images : [] } : empty);
        setErrors({});
    }, [editProduct, isOpen]);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Required';
        if (!form.category.trim()) errs.category = 'Required';
        if (!form.pricePerDay || Number(form.pricePerDay) <= 0) errs.pricePerDay = 'Must be > 0';
        if (form.retailPrice && Number(form.retailPrice) <= 0) errs.retailPrice = 'Must be > 0';
        if (form.securityDeposit === '' || Number(form.securityDeposit) < 0) errs.securityDeposit = 'Must be ≥ 0';
        if (!form.description.trim()) errs.description = 'Required';
        if (!form.stockQuantity || Number(form.stockQuantity) < 1) errs.stockQuantity = 'Must be ≥ 1';
        if (!form.sizes.length) errs.sizes = 'Select size';
        if (!form.images.some(img => img.trim())) errs.images = 'Image required';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            const finalImages = form.images
                .map(img => typeof img === 'string' ? img : img.url)
                .filter(img => img.trim() && !img.startsWith('blob:')); // Don't allow local blobs to be saved

            if (finalImages.length === 0) {
                toast.error("Valid cloud-synced images required");
                return;
            }

            await onSave({
                ...form,
                pricePerDay: Number(form.pricePerDay),
                retailPrice: form.retailPrice ? Number(form.retailPrice) : null,
                securityDeposit: Number(form.securityDeposit),
                stockQuantity: Number(form.stockQuantity),
                images: finalImages,
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create local preview immediately
        const localUrl = URL.createObjectURL(file);
        const newImageObj = { url: localUrl, uploading: true, error: null };
        setForm(f => ({ ...f, images: [...f.images.filter(img => typeof img === 'string' ? img !== '' : true), newImageObj] }));

        try {
            const optimizedUrl = await uploadImageFast(file, 'products');
            // Resolve preview with final URL
            setForm(f => ({
                ...f,
                images: f.images.map(img => img === newImageObj ? optimizedUrl : img)
            }));
        } catch (error) {
            console.error(error);
            const isConfigError = error.message?.includes('Supabase credentials');
            toast.error(isConfigError ? "Supabase keys missing in .env" : "Upload failed");

            // Mark the preview as failed instead of removing it immediately
            // This lets the user see what they selected even if it didn't sync
            setForm(f => ({
                ...f,
                images: f.images.map(img => img === newImageObj ? { ...img, uploading: false, error: error.message } : img)
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-midnight/90 backdrop-blur-xl" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-midnight-deep border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden animate-luxury-pop max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h2 className="font-playfair text-2xl font-black text-white">{editProduct ? 'Edit Portfolio Asset' : 'Add New Curated Asset'}</h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    {errors.submit && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold">{errors.submit}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={darkLabelClass}>Asset Title</label>
                            <input className={darkInputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Vintage Velvet Tuxedo" />
                            {errors.name && <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold">{errors.name}</p>}
                        </div>
                        <div>
                            <label className={darkLabelClass}>Category Select</label>
                            <input list="categories" className={darkInputClass} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Choose category..." />
                            <datalist id="categories">
                                {CATEGORIES.map(c => <option key={c} value={c} />)}
                            </datalist>
                            {errors.category && <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold">{errors.category}</p>}
                        </div>
                    </div>

                    <div>
                        <label className={darkLabelClass}>Product Narrative</label>
                        <textarea className={`${darkInputClass} resize-none`} rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the heritage and design..."></textarea>
                        {errors.description && <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="col-span-1">
                            <label className={darkLabelClass}>Daily Yield</label>
                            <input type="number" className={darkInputClass} value={form.pricePerDay} onChange={e => setForm(f => ({ ...f, pricePerDay: e.target.value }))} />
                        </div>
                        <div className="col-span-1">
                            <label className={darkLabelClass}>Retail Val</label>
                            <input type="number" className={darkInputClass} value={form.retailPrice} onChange={e => setForm(f => ({ ...f, retailPrice: e.target.value }))} />
                        </div>
                        <div className="col-span-1">
                            <label className={darkLabelClass}>Bond (Deposit)</label>
                            <input type="number" className={darkInputClass} value={form.securityDeposit} onChange={e => setForm(f => ({ ...f, securityDeposit: e.target.value }))} />
                        </div>
                        <div className="col-span-1">
                            <label className={darkLabelClass}>Inventory</label>
                            <input type="number" className={darkInputClass} value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <label className={darkLabelClass}>Available Dimensions</label>
                        <div className="flex flex-wrap gap-2">
                            {ALL_SIZES.map(size => (
                                <button key={size} type="button" onClick={() => toggleSize(size)}
                                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest border transition-all ${form.sizes.includes(size) ? 'bg-gold text-midnight border-gold shadow-glow' : 'border-white/10 text-gray-500 hover:border-gold/50 hover:text-gold'}`}>
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={darkLabelClass}>Visual Assets (Limit 5)</label>
                        <div className="flex flex-wrap gap-4">
                            {form.images.map((img, i) => {
                                const url = typeof img === 'string' ? img : img.url;
                                if (!url || !url.trim()) return null;
                                const isUploading = typeof img === 'object' && img.uploading;
                                const hasError = typeof img === 'object' && img.error;

                                return (
                                    <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group shadow-2xl">
                                        <img src={url} alt="" className={`w-full h-full object-cover ${isUploading ? 'opacity-40 grayscale' : ''}`} />

                                        {isUploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-midnight/20">
                                                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}

                                        {hasError && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/20 backdrop-blur-sm p-2 text-center">
                                                <AlertTriangle size={16} className="text-red-500 mb-1" />
                                                <span className="text-[6px] font-black text-white uppercase leading-tight">Sync Failed</span>
                                            </div>
                                        )}

                                        <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                                            className="absolute top-1 right-1 bg-midnight-deep/80 text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20">
                                            <X size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                            {form.images.length < 5 && (
                                <label className="w-24 h-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-gold hover:text-gold hover:bg-gold/5 cursor-pointer transition-all">
                                    {uploadingImage ? <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div> : <><UploadCloud size={24} /><span className="text-[8px] font-black uppercase mt-1 tracking-widest">Share</span></>}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-white/5 bg-white/5 flex gap-4">
                    <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-all bg-white/5 border border-white/10">Withdraw</button>
                    <button type="submit" onClick={handleSubmit} disabled={loading || uploadingImage} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-gold text-midnight hover:scale-105 hover:shadow-glow transition-all">
                        {loading ? 'Processing...' : (editProduct ? 'Finalize Changes' : 'Publish Asset')}
                    </button>
                </div>
            </div>
        </div>
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
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-midnight/90 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-midnight-deep border border-red-500/20 rounded-[2.5rem] p-10 text-center animate-luxury-pop shadow-3xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <Trash2 size={40} className="text-red-500" />
                </div>
                <h3 className="font-playfair text-2xl font-black text-white mb-4">Decommission Asset?</h3>
                <p className="text-gray-500 text-sm mb-8">Are you certain you wish to remove <span className="text-white font-bold">{product?.name}</span> from the active collection?</p>
                {activeRentalCount > 0 && (
                    <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-xs font-bold flex items-center gap-3">
                        <AlertTriangle size={20} />
                        <span className="text-left">Critical: {activeRentalCount} active contracts found.</span>
                    </div>
                )}
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all">Cancel</button>
                    <button onClick={handleConfirm} disabled={loading} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-red-500 text-white hover:bg-red-600 transition-all">{loading ? '...' : 'Decommission'}</button>
                </div>
            </div>
        </div>
    );
}

export default function ProductManagement() {
    const { myProducts, createProduct, updateProduct, deleteProduct, loading } = useProducts();
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
        toast.success('Asset published');
    };

    const handleEdit = async (form) => {
        await updateProduct(editProduct.id, form);
        toast.success('Asset refined');
        setEditProduct(null);
    };

    const handleDelete = async () => {
        await deleteProduct(deleteTarget.id);
        toast.success('Asset removed');
        setDeleteTarget(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight-deep to-midnight p-6 text-white space-y-8 font-sans">
            {loading && <Loader message="Accessing inventory..." />}

            {!loading && (
                <>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 animate-luxury-entry stagger-1">
                        <div className="space-y-2">
                            <h1 className="font-playfair text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tighter">Collection</h1>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">{myProducts.length} Assets Curated</p>
                            </div>
                        </div>
                        <button
                            onClick={() => vendorProfileComplete ? setCreateOpen(true) : null}
                            disabled={!vendorProfileComplete}
                            className="flex items-center gap-2.5 px-8 py-4 bg-gold text-midnight rounded-2xl text-[10px] font-black hover:scale-105 hover:shadow-glow transition-all shadow-2xl uppercase tracking-widest disabled:opacity-50"
                        >
                            <Plus size={18} strokeWidth={3} />
                            List New Asset
                        </button>
                    </div>

                    {!vendorProfileComplete && (
                        <div className="animate-luxury-entry stagger-2 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-between gap-4 group hover:border-amber-500/40 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Portfolio Incomplete</h3>
                                    <p className="text-amber-500/70 text-xs">Verify your workshop details to begin listing elite assets.</p>
                                </div>
                            </div>
                            <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-amber-500 text-midnight rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Complete Profile</button>
                        </div>
                    )}

                    {myProducts.length === 0 ? (
                        <div className="animate-luxury-entry stagger-3 bg-midnight/40 backdrop-blur-3xl border border-dashed border-white/10 rounded-[3rem] p-24 text-center">
                            <Package size={80} strokeWidth={0.5} className="text-gray-700 mx-auto mb-8 animate-float" />
                            <h3 className="font-playfair text-3xl font-black text-gray-500 mb-2 tracking-tight">The Portfolio is Vacant</h3>
                            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Curate your first masterpiece to begin</p>
                            <button onClick={() => setCreateOpen(true)} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gold hover:bg-gold hover:text-midnight transition-all">Commence Curation</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                            {myProducts.map((product, i) => (
                                <div key={product.id} className={`animate-luxury-entry stagger-${(i % 5) + 1} group relative bg-midnight/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-gold/30 transition-all duration-700`}>
                                    <div className="relative aspect-[4/5] overflow-hidden">
                                        <img src={product.images?.[0] || DEFAULT_IMAGE} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent opacity-80" />

                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                            <span className="px-3 py-1 bg-midnight/80 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-gold text-center">{product.category}</span>
                                            {product.availableQuantity <= 1 && (
                                                <span className="px-3 py-1 bg-red-500/80 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-white text-center">Low Velocity</span>
                                            )}
                                        </div>

                                        <div className="absolute bottom-6 left-6 right-6">
                                            <h3 className="font-playfair text-xl font-black text-white mb-1 truncate">{product.name}</h3>
                                            <p className="text-gold font-black text-base tracking-tighter">{formatCurrency(product.pricePerDay)}<span className="text-[10px] text-gray-400 font-bold uppercase ml-1">/day</span></p>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 pb-4">
                                            <span className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${product.availableQuantity > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} /> {product.availableQuantity} Avail</span>
                                            <span>Cap: {product.stockQuantity}</span>
                                        </div>

                                        <div className="flex gap-3">
                                            <button onClick={() => setEditProduct(product)} className="flex-1 py-3.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"><Edit2 size={14} /> Refine</button>
                                            <button onClick={() => setDeleteTarget(product)} className="flex-1 py-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"><Trash2 size={14} /> Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <ProductFormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} />
                    <ProductFormModal isOpen={!!editProduct} onClose={() => setEditProduct(null)} editProduct={editProduct} onSave={handleEdit} />
                    <DeleteProductModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} product={deleteTarget}
                        onConfirm={handleDelete} activeRentalCount={deleteTarget ? getActiveRentalCount(deleteTarget.id) : 0} />
                </>
            )}
        </div>
    );
}
