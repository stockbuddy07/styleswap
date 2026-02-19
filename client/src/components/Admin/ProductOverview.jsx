import React, { useState, useMemo } from 'react';
import { Search, Eye, Package, Store } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useUsers } from '../../context/UserContext';
import Modal from '../Shared/Modal';
import { formatCurrency, getStockStatus } from '../../utils/helpers';

function ProductDetailModal({ product, onClose }) {
    const { users } = useUsers();
    const vendor = users.find(u => u.id === product?.subAdminId);

    if (!product) return null;
    const stock = getStockStatus(product.availableQuantity);

    return (
        <Modal isOpen={!!product} onClose={onClose} title="Product Details" size="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-full h-64 object-cover rounded-xl"
                        onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                    />
                    <div className="flex gap-2 mt-2">
                        {product.images?.slice(1).map((img, i) => (
                            <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg" onError={e => { e.target.style.display = 'none'; }} />
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <h3 className="font-playfair text-xl font-bold text-midnight">{product.name}</h3>
                    <div className="flex items-center gap-2">
                        <Store size={14} className="text-gold" />
                        <span className="text-sm font-semibold text-gold">{product.shopName}</span>
                    </div>
                    {vendor && <p className="text-xs text-gray-500">Vendor: {vendor.name} · {vendor.email}</p>}
                    <span className="badge bg-blue-100 text-blue-800">{product.category}</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-midnight">{formatCurrency(product.pricePerDay)}</span>
                        <span className="text-gray-500 text-sm">/day</span>
                    </div>
                    <p className="text-sm text-gray-500">Security deposit: {formatCurrency(product.securityDeposit)}</p>
                    <p className="text-gray-600 text-sm">{product.description}</p>
                    <div className="flex gap-2 flex-wrap">
                        {product.sizes?.map(s => (
                            <span key={s} className="px-2 py-1 border border-gray-200 rounded text-xs text-gray-600">{s}</span>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <span className={`badge ${stock.color}`}>{stock.label}</span>
                        <span className="text-sm text-gray-500">{product.availableQuantity}/{product.stockQuantity} available</span>
                    </div>
                    {product.ratings > 0 && (
                        <div className="flex items-center gap-1">
                            {'★'.repeat(Math.round(product.ratings))}{'☆'.repeat(5 - Math.round(product.ratings))}
                            <span className="text-sm text-gray-500 ml-1">{product.ratings}</span>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

export default function ProductOverview() {
    const { allProducts } = useProducts();
    const { users } = useUsers();
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
        <div className="space-y-6">
            <div>
                <h1 className="font-playfair text-2xl font-bold text-midnight">All Products</h1>
                <p className="text-gray-500 text-sm mt-1">{allProducts.length} products across {vendors.length} vendors</p>
            </div>

            {/* Vendor summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {vendors.map(v => (
                    <div key={v.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 border border-gray-100">
                        <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center flex-shrink-0">
                            <Store size={18} className="text-midnight" />
                        </div>
                        <div>
                            <p className="font-semibold text-midnight text-sm">{v.shopName}</p>
                            <p className="text-gray-400 text-xs">{vendorProductCounts[v.id] || 0} products</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by product name or shop..."
                        className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                </div>
                <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white">
                    <option value="All">All Vendors</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.shopName}</option>)}
                </select>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white">
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Vendor</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Category</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">Price/Day</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Stock</th>
                                <th className="text-right px-4 py-3 text-gray-500 font-medium">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No products found</td></tr>
                            ) : filtered.map(product => {
                                const stock = getStockStatus(product.availableQuantity);
                                return (
                                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={product.images?.[0]} alt={product.name}
                                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                    onError={e => { e.target.src = 'https://via.placeholder.com/40?text=?'; }} />
                                                <span className="font-medium text-midnight">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-gold font-medium text-xs">{product.shopName}</span>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className="badge bg-blue-50 text-blue-700">{product.category}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-midnight">{formatCurrency(product.pricePerDay)}</td>
                                        <td className="px-4 py-3 text-right hidden lg:table-cell">
                                            <span className={`badge ${stock.color}`}>{product.availableQuantity}/{product.stockQuantity}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => setSelectedProduct(product)}
                                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" aria-label="View product">
                                                <Eye size={15} />
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
        </div>
    );
}
