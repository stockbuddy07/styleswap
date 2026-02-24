import React, { useState, useEffect } from 'react';
import { X, UploadCloud, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { uploadImageFast } from '../../utils/supabaseUtility';
import { useUsers } from '../../context/UserContext';

const CATEGORIES = ['Wedding Attire', 'Blazers', 'Shoes', 'Accessories'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '5', '6', '7', '8', '9', '10', '11', '12', 'One Size'];

const darkInputClass = "w-full bg-midnight-accent/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all placeholder:text-gray-600";
const darkLabelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block ml-1";

export default function ProductFormModal({ isOpen, onClose, editProduct, onSave, isAdmin }) {
    const empty = { name: '', category: '', pricePerDay: '', retailPrice: '', securityDeposit: '', description: '', stockQuantity: '', sizes: [], images: [''], subAdminId: '' };
    const [form, setForm] = useState(editProduct || empty);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const toast = useToast();
    const { users } = useUsers();

    const vendors = React.useMemo(() => users.filter(u => u.role === 'Sub-Admin'), [users]);

    useEffect(() => {
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
        if (!form.images.some(img => img && (typeof img === 'string' ? img.trim() : img.url))) errs.images = 'Image required';
        if (isAdmin && !form.subAdminId) errs.subAdminId = 'Vendor required';
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
                .filter(img => img && img.trim() && !img.startsWith('blob:'));

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

        const localUrl = URL.createObjectURL(file);
        const newImageObj = { url: localUrl, uploading: true, error: null };
        setForm(f => ({ ...f, images: [...f.images.filter(img => typeof img === 'string' ? img !== '' : true), newImageObj] }));

        try {
            const optimizedUrl = await uploadImageFast(file, 'products');
            setForm(f => ({
                ...f,
                images: f.images.map(img => img === newImageObj ? optimizedUrl : img)
            }));
        } catch (error) {
            console.error(error);
            const isConfigError = error.message?.includes('Supabase credentials');
            toast.error(isConfigError ? "Supabase keys missing in .env" : "Upload failed");
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

                    {isAdmin && (
                        <div>
                            <label className={darkLabelClass}>Assign to Vendor (Admin Only)</label>
                            <select
                                className={darkInputClass}
                                value={form.subAdminId}
                                onChange={e => setForm(f => ({ ...f, subAdminId: e.target.value }))}
                            >
                                <option value="" className="bg-midnight font-bold">Select Vendor...</option>
                                {vendors.map(v => (
                                    <option key={v.id} value={v.id} className="bg-midnight font-bold">
                                        {v.shopName?.toUpperCase()} ({v.name})
                                    </option>
                                ))}
                            </select>
                            {errors.subAdminId && <p className="text-red-500 text-[10px] mt-2 ml-1 font-bold">{errors.subAdminId}</p>}
                        </div>
                    )}

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
