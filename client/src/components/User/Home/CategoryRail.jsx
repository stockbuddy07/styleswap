import React from 'react';
import { Sparkles, Heart, Star, Sparkle, ShoppingBag, Send, Gem, Zap, Crown, Flame, Diamond, Compass, Trophy, ChevronRight } from 'lucide-react';

const CATEGORIES = [
    {
        name: 'Wedding',
        image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop',
        bgImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1000&auto=format&fit=crop',
        desc: 'Sovereign attire for grand unions.',
        color: 'from-emerald-900/80',
        accent: 'text-emerald-400'
    },
    {
        name: 'Party',
        image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800&auto=format&fit=crop',
        bgImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop',
        desc: 'Electric midnight silhouettes.',
        color: 'from-indigo-900/80',
        accent: 'text-indigo-400'
    },
    {
        name: 'Casual',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
        bgImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
        desc: 'Elevated every day DNA.',
        color: 'from-zinc-900/80',
        accent: 'text-zinc-400'
    },
    {
        name: 'Formal',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
        bgImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop',
        desc: 'Unyielding precision.',
        color: 'from-slate-900/80',
        accent: 'text-slate-400'
    },
    {
        name: 'Shoes',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
        bgImage: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop',
        desc: 'The architectural foundation.',
        color: 'from-orange-900/80',
        accent: 'text-orange-400'
    },
    {
        name: 'Jewelry',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb0537bf?q=80&w=800&auto=format&fit=crop',
        bgImage: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=1000&auto=format&fit=crop',
        desc: 'Celestial brilliance.',
        color: 'from-rose-900/80',
        accent: 'text-rose-400'
    },
    {
        name: 'Accessories',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
        bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
        desc: 'The defining details.',
        color: 'from-neutral-100',
        accent: 'text-neutral-500'
    },
    {
        name: 'Specials',
        image: 'https://images.unsplash.com/photo-1485230946086-1d99d543b599?q=80&w=800&auto=format&fit=crop',
        bgImage: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1000&auto=format&fit=crop',
        desc: 'Fragmented unique collections.',
        color: 'from-amber-900/80',
        accent: 'text-amber-400'
    },
];

export default function CategoryRail({ onSelect }) {
    return (
        <div className="pt-4 pb-16 animate-luxury-entry px-4 sm:px-0">
            {/* Ultra-Compact Header */}
            <div className="flex items-end justify-between gap-4 mb-10">
                <div className="space-y-0.5">
                    <h3 className="font-playfair text-4xl font-black text-midnight tracking-tighter leading-none">Occasion Taxonomy</h3>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">The DNA of StyleSwap</p>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent ml-8 hidden md:block mb-2" />
            </div>

            {/* BENTO GRID - With "Show Products" Action Links */}
            <div className="grid grid-cols-12 gap-3 sm:gap-4 auto-rows-[130px] sm:auto-rows-[170px]">

                {/* 1. Feature (Wedding) */}
                <div
                    onClick={() => onSelect && onSelect(CATEGORIES[0].name)}
                    className="col-span-12 sm:col-span-4 row-span-2 group relative bg-black rounded-[1.8rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5 transition-all duration-700 hover:border-emerald-400/30 shadow-2xl"
                >
                    <div className="absolute inset-0 z-0">
                        <img src={CATEGORIES[0].bgImage} className="w-full h-full object-cover opacity-50 blur-[2px] scale-110 group-hover:scale-100 transition-transform duration-[2s]" />
                        <div className={`absolute inset-0 bg-gradient-to-t ${CATEGORIES[0].color} via-transparent to-transparent`} />
                        <img src={CATEGORIES[0].image} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:opacity-60 transition-opacity" />
                    </div>
                    <div className="relative z-10 h-full p-6 sm:p-8 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center">
                            <Crown size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="font-playfair text-[22px] sm:text-[28px] font-bold text-white mb-2 leading-tight">{CATEGORIES[0].name}</h4>
                            <p className="text-gray-300 text-[10px] leading-relaxed max-w-[200px] line-clamp-2 md:mb-4">{CATEGORIES[0].desc}</p>
                            <div className="hidden md:flex items-center gap-1 text-[9px] font-black text-emerald-400 uppercase tracking-widest group-hover:gap-2 transition-all">
                                Show Products <ChevronRight size={10} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Interactive Deck (Party) */}
                <div
                    onClick={() => onSelect && onSelect(CATEGORIES[1].name)}
                    className="col-span-12 sm:col-span-5 row-span-1 group relative bg-black rounded-[1.8rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5 transition-all duration-700 hover:border-indigo-400/30"
                >
                    <div className="absolute inset-0 z-0">
                        <img src={CATEGORIES[1].bgImage} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[2s]" />
                        <div className={`absolute inset-0 bg-gradient-to-r ${CATEGORIES[1].color} via-transparent to-transparent`} />
                    </div>
                    <div className="relative z-10 h-full flex items-center p-6 sm:p-8 gap-4">
                        <div className="flex-1 space-y-2">
                            <div>
                                <h4 className="font-playfair text-xl sm:text-2xl font-bold text-white leading-none">{CATEGORIES[1].name}</h4>
                                <p className="text-gray-300 text-[9px] sm:text-[10px] leading-tight line-clamp-2 mt-1">{CATEGORIES[1].desc}</p>
                            </div>
                            <div className="flex items-center gap-1 text-[8px] font-black text-indigo-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                Show Products <ChevronRight size={8} />
                            </div>
                        </div>
                        <div className="relative w-24 h-20 shrink-0">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    style={{ transform: `rotate(${i * 10 - 20}deg) translateX(${i * 8}px)` }}
                                    className="absolute inset-0 bg-black/50 rounded-xl shadow-xl border border-white/10 overflow-hidden transform-gpu group-hover:rotate-0 group-hover:translate-x-0 group-hover:-translate-y-4 transition-all duration-700"
                                >
                                    <img src={CATEGORIES[1].image} className="w-full h-full object-cover opacity-80" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Icon Prism (Casual) */}
                <div
                    onClick={() => onSelect && onSelect(CATEGORIES[2].name)}
                    className="col-span-6 sm:col-span-3 row-span-1 group relative bg-black rounded-[1.8rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5 transition-all duration-700 hover:border-zinc-400/30"
                >
                    <div className="absolute inset-0 z-0">
                        <img src={CATEGORIES[2].bgImage} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[2s]" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORIES[2].color} via-transparent to-transparent`} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center rotate-12 group-hover:rotate-0 transition-all duration-700 shadow-2xl backdrop-blur-sm">
                            <Sparkles size={24} className="text-zinc-300" />
                        </div>
                        <div>
                            <h4 className="font-playfair text-lg sm:text-xl font-bold text-white leading-none">{CATEGORIES[2].name}</h4>
                            <div className="flex items-center justify-center gap-1 text-[8px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-2 group-hover:text-white transition-colors">
                                Show Products <ChevronRight size={8} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Accessories - Ivory */}
                <div
                    onClick={() => onSelect && onSelect(CATEGORIES[6].name)}
                    className="col-span-6 sm:col-span-3 row-span-1 group relative bg-white rounded-[1.8rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer border border-gray-100 transition-all duration-700 hover:shadow-2xl"
                >
                    <div className="absolute inset-0 z-0 opacity-40">
                        <img src={CATEGORIES[6].bgImage} className="w-full h-full object-cover blur-[1px] group-hover:scale-110 transition-transform duration-[2s]" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-3">
                        <div className="w-12 h-16 rounded-lg overflow-hidden shadow-lg -rotate-3 group-hover:rotate-0 transition-all duration-700 border border-gray-100">
                            <img src={CATEGORIES[6].image} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h4 className="font-playfair text-sm sm:text-base font-black text-midnight leading-none uppercase tracking-tight">{CATEGORIES[6].name}</h4>
                            <div className="text-[8px] font-black text-midnight/40 uppercase tracking-widest mt-2 group-hover:text-midnight transition-colors flex items-center justify-center gap-1">
                                Show Products <ChevronRight size={8} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Architectural (Shoes) */}
                <div
                    onClick={() => onSelect && onSelect(CATEGORIES[4].name)}
                    className="col-span-12 sm:col-span-5 row-span-1 group relative bg-black rounded-[1.8rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5 transition-all duration-700 hover:border-orange-400/30"
                >
                    <div className="absolute inset-0 z-0">
                        <img src={CATEGORIES[4].bgImage} className="w-full h-full object-cover opacity-50 group-hover:rotate-6 group-hover:scale-125 transition-all duration-[3s]" />
                        <div className={`absolute inset-0 bg-gradient-to-r ${CATEGORIES[4].color} via-transparent to-transparent`} />
                    </div>
                    <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none pr-4 z-10">
                        <div className="h-full flex items-center justify-end -space-x-12 rotate-6 group-hover:rotate-0 transition-transform duration-700">
                            <div className="w-40 h-28 rounded-2xl bg-black/40 shadow-2xl overflow-hidden border border-white/10 rotate-[-10deg] backdrop-blur-sm">
                                <img src={CATEGORIES[4].image} className="w-full h-full object-cover opacity-80" />
                            </div>
                        </div>
                    </div>
                    <div className="relative z-20 h-full flex flex-col justify-center p-8 sm:p-10">
                        <h4 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tighter uppercase">{CATEGORIES[4].name}</h4>
                        <div className="flex items-center gap-2 text-orange-400 text-[8px] font-black uppercase tracking-[0.4em] group-hover:translate-x-2 transition-transform">
                            Show Products <ChevronRight size={8} />
                        </div>
                    </div>
                </div>

                {/* 6. Status Vault (Jewelry) */}
                <div
                    onClick={() => onSelect && onSelect(CATEGORIES[5].name)}
                    className="col-span-12 sm:col-span-4 row-span-1 group relative bg-black rounded-[1.8rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5 transition-all duration-700 hover:border-rose-400/30"
                >
                    <div className="absolute inset-0 z-0">
                        <img src={CATEGORIES[5].bgImage} className="w-full h-full object-cover opacity-30 blur-[1px] group-hover:scale-110 transition-transform duration-[3s]" />
                        <div className={`absolute inset-0 bg-gradient-to-t ${CATEGORIES[5].color} via-transparent to-transparent`} />
                    </div>
                    <div className="relative z-10 h-full p-6 sm:p-8 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_12px_rgba(251,113,133,1)]" />
                            <div className="flex items-center gap-1 text-rose-400 text-[8px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                Show Products <ChevronRight size={8} />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-playfair text-2xl sm:text-3xl font-bold text-white leading-none">{CATEGORIES[5].name}</h4>
                            <p className="text-rose-400 text-[8px] font-bold uppercase tracking-[0.2em] mt-1">HERITAGE</p>
                        </div>
                    </div>
                </div>

                {/* 7. Formal */}
                <div
                    onClick={() => onSelect && onSelect(CATEGORIES[3].name)}
                    className="col-span-6 sm:col-span-4 row-span-1 group relative bg-black rounded-[1.8rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5 transition-all duration-700 hover:border-slate-400/30"
                >
                    <div className="absolute inset-0 z-0">
                        <img src={CATEGORIES[3].bgImage} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[2s]" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORIES[3].color} from-slate-900/90 to-transparent`} />
                    </div>
                    <div className="relative z-10 h-full p-6 sm:p-8 flex flex-col justify-center gap-2">
                        <h4 className="font-playfair text-xl sm:text-2xl font-bold text-white leading-none">{CATEGORIES[3].name}</h4>
                        <div className="flex items-center gap-1 text-slate-400/80 text-[8px] font-bold uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                            Show Products <ChevronRight size={8} />
                        </div>
                    </div>
                </div>

                {/* 8. Specials */}
                <div
                    onClick={() => onSelect && onSelect(CATEGORIES[7].name)}
                    className="col-span-6 sm:col-span-4 row-span-1 group relative bg-black rounded-[1.8rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5 transition-all duration-700 hover:border-amber-400/30"
                >
                    <div className="absolute inset-0 z-0">
                        <img src={CATEGORIES[7].bgImage} className="w-full h-full object-cover opacity-50 group-hover:rotate-[-5deg] group-hover:scale-125 transition-all duration-[3s]" />
                        <div className={`absolute inset-0 bg-gradient-to-tr ${CATEGORIES[7].color} via-transparent to-transparent`} />
                    </div>
                    <div className="relative z-10 h-full p-6 sm:p-8 flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-playfair text-xl sm:text-2xl font-bold text-white leading-none">{CATEGORIES[7].name}</h4>
                            <div className="flex items-center gap-1 text-amber-400/80 text-[8px] font-black uppercase tracking-[0.3em] group-hover:translate-x-1 transition-transform">
                                Show Products <ChevronRight size={8} />
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-amber-400/20 flex items-center justify-center bg-amber-400/10 backdrop-blur-sm">
                            <Zap size={18} className="text-amber-400" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
