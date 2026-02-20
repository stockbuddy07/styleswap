import React, { useState, useMemo } from 'react';
import { Search, Eye, Package, Store, ChevronRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useUsers } from '../../context/UserContext';
import Modal from '../Shared/Modal';
import Loader from '../Shared/Loader';
import { formatCurrency, getStockStatus, DEFAULT_IMAGE } from '../../utils/helpers';

function ProductDetailModal({ product, onClose }) {
    const { users } = useUsers();
    const vendor = users.find(u => u.id === product?.subAdminId);

    if (!product) return null;
    const stock = getStockStatus(product.availableQuantity);

    return (
        <Modal
            isOpen={!!product}
            onClose={onClose}
            title="Product Identity"
            size="lg"
            className="bg-midnight-deep/95 backdrop-blur-3xl border border-white/10 text-white rounded-[2.5rem] shadow-2xl"
            headerClassName="border-white/5 py-8 px-10"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-full h-64 object-cover rounded-xl border border-white/10"
                        onError={e => { e.target.src = DEFAULT_IMAGE; }}
                    />
                    <div className="flex gap-2 mt-2">
                        {product.images?.slice(1).map((img, i) => (
                            <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-white/10 opacity-70 hover:opacity-100 transition-opacity" onError={e => { e.target.style.display = 'none'; }} />
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="font-playfair text-2xl font-bold text-white">{product.name}</h3>

                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                        <Store size={16} className="text-gold" />
                        <span className="text-sm font-semibold text-gray-200">{product.shopName}</span>
                    </div>

                    {vendor && <p className="text-xs text-gray-400">Vendor: {vendor.name} · {vendor.email}</p>}

                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20">
                        {product.category}
                    </span>

                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gold">{formatCurrency(product.pricePerDay)}</span>
                        <span className="text-gray-400 text-sm">/day</span>
                    </div>

                    <p className="text-sm text-gray-400">Security deposit: <span className="text-white">{formatCurrency(product.securityDeposit)}</span></p>

                    <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>

                    <div className="flex gap-2 flex-wrap">
                        {product.sizes?.map(s => (
                            <span key={s} className="px-3 py-1 border border-white/10 bg-white/5 rounded text-xs text-gray-300">{s}</span>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stock.color === 'bg-green-100 text-green-800' ? 'bg-green-500/20 text-green-400 border-green-500/20' : stock.color === 'bg-yellow-100 text-yellow-800' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>
                            {stock.label}
                        </span>
                        <span className="text-sm text-gray-500">{product.availableQuantity}/{product.stockQuantity} available</span>
                    </div>

                    {product.ratings > 0 && (
                        <div className="flex items-center gap-1 text-gold">
                            {'★'.repeat(Math.round(product.ratings))}
                            <span className="text-gray-600">{'☆'.repeat(5 - Math.round(product.ratings))}</span>
                            <span className="text-sm text-gray-400 ml-1">({product.ratings})</span>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

export default function ProductOverview() {
    const { allProducts, loading: productsLoading } = useProducts();
    const { users, loading: usersLoading } = useUsers();
    const loading = productsLoading || usersLoading;
    const [search, setSearch] = useState('');
    const [vendorFilter, setVendorFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const vendors = useMemo(() => users.filter(u => u.role === 'Sub-Admin'), [users]);
    const categories = useMemo(() => [...new Set(allProducts.map(p => p.category))], [allProducts]);

    const filtered = useMemo(() => {
        return allProducts.filter(p => {
            const q = search.toLowerCase();
            const matchSearch = !q || p.name.toLowerCase().includes(q) || p.shopName.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
            const matchVendor = vendorFilter === 'All' || p.subAdminId === vendorFilter;
            const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
            return matchSearch && matchVendor && matchCat;
        });
    }, [allProducts, search, vendorFilter, categoryFilter]);

    // Products per vendor count
    const vendorProductCounts = useMemo(() => {
        const counts = {};
        allProducts.forEach(p => { counts[p.subAdminId] = (counts[p.subAdminId] || 0) + 1; });
        return counts;
    }, [allProducts]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight-deep to-midnight p-6 text-white space-y-8 font-sans">
            {loading && <Loader fullPage={false} message="Curating global inventory..." />}
            {!loading && (
                <>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 animate-luxury-entry stagger-1">
                        <div className="space-y-2">
                            <h1 className="font-playfair text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tighter">Global Inventory</h1>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-gold/20">
                                    {allProducts.length} Premium Assets
                                </span>
                                <div className="w-1 h-1 rounded-full bg-gray-700" />
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Across {vendors.length} Verified Partners</p>
                            </div>
                        </div>
                    </div>

                    {/* Vendor summary cards */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-luxury-entry stagger-2">
                        {vendors.map((v, i) => (
                            <div key={v.id} className="bg-midnight/40 backdrop-blur-2xl rounded-[1.5rem] p-5 flex items-center gap-5 border border-white/5 hover:border-gold/30 transition-all duration-700 group shadow-lg">
                                <div className="w-14 h-14 bg-midnight-accent rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
                                    <Store size={24} className="text-gold group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="overflow-hidden space-y-0.5">
                                    <p className="font-black text-white text-sm truncate tracking-tight group-hover:text-gold transition-colors">{v.shopName}</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-gold/50" />
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{vendorProductCounts[v.id] || 0} Assets</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-6 bg-midnight/40 backdrop-blur-2xl p-6 rounded-[2rem] shadow-2xl border border-white/5 animate-luxury-entry stagger-3">
                        <div className="relative flex-1 group">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-all duration-300" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search inventory..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-gold/5 focus:border-gold/30 transition-all placeholder:text-gray-600 font-medium"
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                            <div className="relative flex-1">
                                <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-3.5 text-sm text-white focus:outline-none focus:ring-4 focus:ring-gold/5 focus:border-gold/30 transition-all cursor-pointer appearance-none font-bold uppercase tracking-widest text-[10px]">
                                    <option value="All" className="bg-midnight font-bold">All Partners</option>
                                    {vendors.map(v => <option key={v.id} value={v.id} className="bg-midnight font-bold">{v.shopName.toUpperCase()}</option>)}
                                </select>
                                <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 rotate-90" />
                            </div>
                            <div className="relative flex-1">
                                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-3.5 text-sm text-white focus:outline-none focus:ring-4 focus:ring-gold/5 focus:border-gold/30 transition-all cursor-pointer appearance-none font-bold uppercase tracking-widest text-[10px]">
                                    <option value="All" className="bg-midnight font-bold">All Tiers</option>
                                    {categories.map(c => <option key={c} value={c} className="bg-midnight font-bold">{c.toUpperCase()}</option>)}
                                </select>
                                <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-midnight/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden animate-luxury-entry stagger-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Details</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden md:table-cell">Partner</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden lg:table-cell">Tier</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Yield/Day</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right hidden xl:table-cell">Utilization</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Observe</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-24 text-gray-600 font-bold uppercase tracking-widest">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-gray-600 shadow-2xl">
                                                        <Package size={32} />
                                                    </div>
                                                    <p className="text-gray-400">Inventory Matrix Empty</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filtered.map((product, i) => {
                                        const stock = getStockStatus(product.availableQuantity);
                                        return (
                                            <tr key={product.id} className="hover:bg-white/5 transition-all duration-500 group border-b border-white/5 last:border-0">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-5">
                                                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex-shrink-0">
                                                            <img src={product.images?.[0]} alt={product.name}
                                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                                onError={e => { e.target.src = DEFAULT_IMAGE; }} />
                                                            <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/0 transition-all duration-700" />
                                                        </div>
                                                        <span className="font-black text-white group-hover:text-gold transition-colors text-base tracking-tight line-clamp-2 max-w-[240px] leading-tight">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 hidden md:table-cell">
                                                    <div className="flex items-center gap-2.5 text-gray-500">
                                                        <div className="p-1 px-1.5 bg-gold/10 rounded">
                                                            <Store size={12} className="text-gold" />
                                                        </div>
                                                        <span className="font-bold text-xs text-gray-400 group-hover:text-white transition-colors">{product.shopName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 hidden lg:table-cell">
                                                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg group-hover:bg-blue-400 group-hover:text-midnight transition-all">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-black text-gold text-lg tracking-tighter">{formatCurrency(product.pricePerDay)}</td>
                                                <td className="px-8 py-5 text-right hidden lg:table-cell">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${stock.color.includes('green') ? 'text-emerald-400 border-emerald-500/30' : stock.color.includes('amber') ? 'text-amber-400 border-amber-500/30' : 'text-red-400 border-red-500/30'}`}>
                                                        {product.availableQuantity} / {product.stockQuantity}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button onClick={() => setSelectedProduct(product)}
                                                        className="p-3 rounded-xl bg-white/5 hover:bg-gold hover:text-midnight hover:shadow-glow text-gray-400 transition-all duration-300 transform group-hover:translate-x-[-8px]" aria-label="Observe product">
                                                        <Eye size={18} strokeWidth={2.5} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
                </>
            )}
        </div>
    );
}
