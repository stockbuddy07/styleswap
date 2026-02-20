import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2883&auto=format&fit=crop',
        title: 'Wedding Season',
        subtitle: 'Rent the perfect look for your special day',
        cta: 'Explore Collection',
        category: 'Wedding Attire',
        color: 'text-white'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2940&auto=format&fit=crop',
        title: 'New Arrivals',
        subtitle: 'Latest trends from top designers',
        cta: 'Shop Now',
        category: 'All',
        color: 'text-white'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2874&auto=format&fit=crop',
        title: 'Summer Vibes',
        subtitle: 'Light, breezy, and stylish',
        cta: 'View Trends',
        category: 'Accessories',
        color: 'text-white'
    }
];

export default function HeroCarousel({ onAction }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % SLIDES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const prev = (e) => {
        e.stopPropagation();
        setCurrent(curr => (curr === 0 ? SLIDES.length - 1 : curr - 1));
    };
    const next = (e) => {
        e.stopPropagation();
        setCurrent(curr => (curr + 1) % SLIDES.length);
    };

    return (
        <div className="relative w-full h-[500px] md:h-[600px] lg:h-[750px] rounded-[3.5rem] overflow-hidden group mb-4 shadow-2xl border border-white/10">
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    onClick={() => onAction && onAction(slide.category)}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Background with Ken Burns */}
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-out ${index === current ? 'scale-110' : 'scale-100'}`}
                    />

                    {/* Luxury Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-deep via-midnight-deep/20 to-transparent z-[2]" />
                    <div className="absolute inset-0 bg-black/10 z-[1]" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-24 lg:px-40 z-[10]">
                        <div className="max-w-3xl space-y-8">
                            <div className={`transition-all duration-1000 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                                <span className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl text-gold text-[11px] font-black uppercase tracking-[0.4em] border border-white/20 shadow-2xl">
                                    <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                    The Elite Selection
                                </span>
                            </div>

                            <h2 className={`text-6xl md:text-8xl lg:text-[10rem] font-playfair font-bold text-white leading-none tracking-tighter transition-all duration-1000 delay-300 ${index === current ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                                {slide.title.split(' ').map((word, i) => (
                                    <span key={i} className={i % 2 !== 0 ? 'text-gold italic block md:inline md:ml-4' : 'block md:inline'}>
                                        {word}{' '}
                                    </span>
                                ))}
                            </h2>

                            <p className={`text-lg md:text-2xl text-gray-300 font-medium max-w-lg leading-relaxed transition-all duration-1000 delay-500 ${index === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                {slide.subtitle}
                            </p>

                            <div className={`pt-6 transition-all duration-1000 delay-700 ${index === current ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAction && onAction(slide.category); }}
                                    className="group relative px-12 py-5 bg-gold text-midnight font-black text-sm uppercase tracking-[0.25em] rounded-2xl overflow-hidden shadow-glow hover:scale-105 active:scale-95 transition-all"
                                >
                                    <span className="relative z-10">{slide.cta}</span>
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Luxury Side Counter */}
                    <div className="absolute right-16 bottom-16 z-20 hidden lg:block overflow-hidden">
                        <div className={`transition-all duration-1000 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                            <span className="text-6xl font-playfair font-bold text-white/10">0{index + 1}</span>
                            <div className="h-px w-20 bg-gold/30 mt-2" />
                        </div>
                    </div>
                </div>
            ))}

            {/* Premium Navigation Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 left-8 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-20px] group-hover:translate-x-0">
                <button onClick={prev} className="w-16 h-16 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-gold hover:text-midnight hover:border-gold transition-all shadow-2xl group/btn">
                    <ChevronLeft size={32} className="group-hover/btn:-translate-x-1 transition-transform" />
                </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-8 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[20px] group-hover:translate-x-0">
                <button onClick={next} className="w-16 h-16 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-gold hover:text-midnight hover:border-gold transition-all shadow-2xl group/btn">
                    <ChevronRight size={32} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Progress Dots / Bars */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-5 items-center">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                        className={`relative h-1.5 transition-all duration-700 rounded-full ${i === current ? 'w-20 bg-white/20' : 'w-4 bg-white/40 hover:bg-white/60 hover:w-8'}`}
                    >
                        {i === current && (
                            <div className="absolute inset-0 bg-gold rounded-full origin-left animate-progress-line" />
                        )}
                        <span className="sr-only">Slide {i + 1}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
