import React, { useMemo } from 'react';
import { Package, AlertCircle, TrendingDown, LayoutGrid } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { formatCurrency, DEFAULT_IMAGE } from '../../utils/helpers';

function StatCard({ icon: Icon, label, value, color, index }) {
    return (
        <div className={`animate-luxury-entry stagger-${index + 1} relative overflow-hidden bg-midnight/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 group hover:border-gold/30 transition-all duration-700 shadow-2xl`}>
            <div className="relative z-10 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} bg-opacity-20 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon size={24} className={color.replace('bg-', 'text-').replace('500', '400')} />
                </div>
                <div>
                    <p className="text-gray-500 text-[10px] font-black tracking-[0.2em] uppercase">{label}</p>
                    <h3 className="text-2xl font-black text-white font-numeric tracking-tighter">{value}</h3>
                </div>
            </div>
        </div>
    );
}

export default function InventoryDashboard() {
    const { myProducts } = useProducts();

    const stats = useMemo(() => {
        const totalItems = myProducts.reduce((sum, p) => sum + p.stockQuantity, 0);
        const lowStock = myProducts.filter(p => p.availableQuantity > 0 && p.availableQuantity <= 2).length;
        const outOfStock = myProducts.filter(p => p.availableQuantity === 0).length;
        const totalProducts = myProducts.length;
        return { totalItems, lowStock, outOfStock, totalProducts };
    }, [myProducts]);

    const getStockStatus = (availableQuantity) => {
        if (availableQuantity === 0) return { label: 'Depleted', color: 'bg-red-100' };
        if (availableQuantity <= 2) return { label: 'Low Velocity', color: 'bg-amber-100' };
        return { label: 'Optimal', color: 'bg-emerald-100' };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight-deep to-midnight p-6 text-white space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 animate-luxury-entry stagger-1">
                <div className="space-y-2">
                    <h1 className="font-playfair text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tighter">Inventory Control</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Real-time Stock Management</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard index={0} icon={LayoutGrid} label="Total Assets" value={stats.totalProducts} color="bg-blue-500" />
                <StatCard index={1} icon={Package} label="Total Units" value={stats.totalItems} color="bg-gold" />
                <StatCard index={2} icon={AlertCircle} label="Low Velocity" value={stats.lowStock} color="bg-amber-500" />
                <StatCard index={3} icon={TrendingDown} label="Depleted" value={stats.outOfStock} color="bg-red-500" />
            </div>

            <div className="bg-midnight/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden animate-luxury-entry stagger-5 group hover:border-gold/20 transition-all duration-700">
                <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                    <h2 className="font-playfair text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Package size={24} className="text-gold" /> Stock Manifest
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                <th className="px-10 py-6">Asset Specification</th>
                                <th className="px-6 py-6">Category</th>
                                <th className="px-6 py-6">Availability</th>
                                <th className="px-6 py-6">Yield</th>
                                <th className="px-10 py-6 text-right">Velocity Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {myProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-24 text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">No assets in collection</td>
                                </tr>
                            ) : (
                                myProducts.map((product, i) => {
                                    const stock = getStockStatus(product.availableQuantity);
                                    return (
                                        <tr key={product.id} className="group/row hover:bg-white/5 transition-colors duration-500">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 group-hover/row:border-gold/30 transition-all">
                                                        <img src={product.images?.[0] || DEFAULT_IMAGE} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="font-bold text-white group-hover/row:text-gold transition-colors">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-medium text-gray-400 text-xs uppercase tracking-wider">{product.category}</td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${stock.color === 'bg-red-100' ? 'bg-red-500' : stock.color === 'bg-amber-100' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${(product.availableQuantity / product.stockQuantity) * 100}%` }} />
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{product.availableQuantity} / {product.stockQuantity} Units</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-numeric font-bold text-gold">{formatCurrency(product.pricePerDay)}</td>
                                            <td className="px-10 py-6 text-right">
                                                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${stock.color === 'bg-red-100' ? 'border-red-500/30 text-red-400 bg-red-500/10' : stock.color === 'bg-amber-100' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'}`}>
                                                    {stock.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
