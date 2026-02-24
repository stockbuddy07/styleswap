import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, AlertTriangle, ArrowRight, UploadCloud, X, Star } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, DEFAULT_IMAGE } from '../../utils/helpers';
import ProductFormModal from '../Shared/ProductFormModal';
import DeleteProductModal from '../Shared/DeleteProductModal';
import Loader from '../Shared/Loader';

const CATEGORIES = ['Wedding Attire', 'Blazers', 'Shoes', 'Accessories'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '5', '6', '7', '8', '9', '10', '11', '12', 'One Size'];


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
