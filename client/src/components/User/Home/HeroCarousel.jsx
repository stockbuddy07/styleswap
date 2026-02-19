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

    // Auto-advance
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
        <div className="relative w-full h-[450px] md:h-[550px] lg:h-[700px] rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] group mb-16 border-4 border-white/10">
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    onClick={() => onAction && onAction(slide.category)}
                    className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Darkening Overlay for readability */}
                    <div className="absolute inset-0 bg-black/20 z-[1] transition-opacity duration-1000" />

                    <img
                        src={slide.image}
                        alt={slide.title}
                        className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${index === current ? 'scale-105' : 'scale-125'}`}
                    />

                    {/* Gradient Mesh overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-midnight/60 via-midnight/20 to-transparent z-[2]" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 lg:px-32 z-[10]">
                        <div className="max-w-2xl">
                            {/* Staggered text animations using transition-delay */}
                            <div className={`space-y-6 transition-all duration-1000 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/90 backdrop-blur-md text-midnight text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-midnight animate-pulse" />
                                    Exclusive Collection
                                </span>

                                <h2 className="text-6xl md:text-8xl lg:text-9xl font-playfair font-bold text-white leading-[0.95] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                    {slide.title.split(' ').map((word, i) => (
                                        <span key={i} className={i % 2 !== 0 ? 'text-gold italic md:block' : 'block'}>
                                            {word}{' '}
                                        </span>
                                    ))}
                                </h2>

                                <p className={`text-xl md:text-2xl text-gray-100/90 font-light max-w-md leading-relaxed drop-shadow-lg transition-all duration-1000 delay-[500ms] ${index === current ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
                                    {slide.subtitle}
                                </p>

                                <div className={`pt-4 transition-all duration-1000 delay-[700ms] ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAction && onAction(slide.category); }}
                                        className="shine-effect bg-white text-midnight font-black px-12 py-5 rounded-2xl hover:bg-gold hover:text-midnight transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(212,175,55,0.4)] hover:scale-105 text-sm uppercase tracking-[0.2em]"
                                    >
                                        {slide.cta}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lateral Slide Counter */}
                    <div className="absolute right-12 bottom-12 z-20 hidden md:flex items-end gap-2 font-playfair text-white/40">
                        <span className="text-4xl font-bold text-gold">0{index + 1}</span>
                        <span className="text-xl pb-1">/ 0{SLIDES.length}</span>
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
