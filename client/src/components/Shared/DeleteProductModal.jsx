import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteProductModal({ isOpen, onClose, product, onConfirm, activeRentalCount }) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } finally {
            setLoading(false);
            onClose();
        }
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
