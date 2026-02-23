import React from 'react';

const CATEGORIES = [
    { name: 'Wedding', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=200&auto=format&fit=crop' },
    { name: 'Party', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=200&auto=format&fit=crop' },
    { name: 'Casual', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop' },
    { name: 'Formal', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200&auto=format&fit=crop' },
    { name: 'Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=200&auto=format&fit=crop' },
    { name: 'Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb0537bf?q=80&w=200&auto=format&fit=crop' },
    { name: 'Bags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=200&auto=format&fit=crop' },
    { name: 'Specials', image: 'https://images.unsplash.com/photo-1485230946086-1d99d543b599?q=80&w=200&auto=format&fit=crop' },
];

export default function CategoryRail({ onSelect }) {
    return (
        <div className="pt-8 pb-0 animate-luxury-entry stagger-3">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <h3 className="font-playfair text-4xl font-black text-midnight tracking-tighter">Occasion Taxonomy</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Navigate by Social Context</p>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent ml-8 hidden md:block mb-3" />
            </div>

            <div className="flex gap-10 overflow-x-auto pt-6 pb-2 scrollbar-hide snap-x">
                {CATEGORIES.map((cat, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect && onSelect(cat.name)}
                        className="flex flex-col items-center gap-6 group flex-shrink-0 min-w-[120px] snap-start"
                    >
                        <div className="relative">
                            {/* Massive Luxury Glow */}
                            <div className="absolute -inset-4 bg-gold/0 rounded-full group-hover:bg-gold/15 blur-2xl transition-all duration-1000 scale-50 group-hover:scale-100" />

                            <div className="w-24 h-24 rounded-3xl p-1 border border-gray-100 group-hover:border-gold/30 transition-all duration-700 relative bg-white shadow-luxury group-hover:shadow-glow group-hover:-translate-y-2 overflow-hidden">
                                <div className="w-full h-full rounded-2xl overflow-hidden relative">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                                    />
                                    <div className="absolute inset-0 bg-midnight/20 group-hover:bg-midnight/5 transition-colors duration-700" />

                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-gold transition-colors duration-500">
                                {cat.name}
                            </span>
                            <div className="w-0 h-0.5 bg-gold group-hover:w-full transition-all duration-500 rounded-full" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
