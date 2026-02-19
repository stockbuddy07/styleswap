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
        <div className="py-6">
            <h3 className="font-playfair text-xl font-bold text-midnight mb-4">Rent by Occasion</h3>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {CATEGORIES.map((cat, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect && onSelect(cat.name)}
                        className="flex flex-col items-center gap-2 group flex-shrink-0 min-w-[80px]"
                    >
                        <div className="w-20 h-20 rounded-full p-1 border-2 border-transparent group-hover:border-gold transition-all">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gold transition-colors">{cat.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
