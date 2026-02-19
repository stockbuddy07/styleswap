import React from 'react';

const CATEGORIES = [
    { name: 'Wedding', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=200&auto=format&fit=crop' },
    { name: 'Party', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=200&auto=format&fit=crop' },
    { name: 'Casual', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop' },
    { name: 'Formal', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200&auto=format&fit=crop' },
    { name: 'Shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55bb2?q=80&w=200&auto=format&fit=crop' },
    { name: 'Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb0537bf?q=80&w=200&auto=format&fit=crop' },
    { name: 'Bags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=200&auto=format&fit=crop' },
    { name: 'Specials', image: 'https://images.unsplash.com/photo-1485230946086-1d99d543b599?q=80&w=200&auto=format&fit=crop' },
];

export default function CategoryRail({ onSelect }) {
    return (
        <div className="py-10">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-playfair text-3xl font-bold text-midnight tracking-tight">Rent by Occasion</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent ml-8 hidden md:block" />
            </div>

            <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide snap-x">
                {CATEGORIES.map((cat, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect && onSelect(cat.name)}
                        className="flex flex-col items-center gap-4 group flex-shrink-0 min-w-[100px] snap-start"
                    >
                        <div className="relative">
                            {/* Glowing Ring Effect */}
                            <div className="absolute -inset-2 bg-gold/0 rounded-full group-hover:bg-gold/20 blur-xl transition-all duration-500 scale-50 group-hover:scale-100" />

                            <div className="w-24 h-24 rounded-full p-1.5 border-2 border-gray-50 group-hover:border-gold transition-all duration-500 relative bg-white shadow-sm group-hover:shadow-glow">
                                <div className="w-full h-full rounded-full overflow-hidden relative">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-midnight/10 group-hover:bg-transparent transition-colors duration-500" />
                                </div>
                            </div>
                        </div>
                        <span className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-midnight transition-colors duration-300">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
