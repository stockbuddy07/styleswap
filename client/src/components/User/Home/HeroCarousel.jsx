import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2883&auto=format&fit=crop',
        title: 'Wedding Season',
        subtitle: 'Rent the perfect look for your special day',
        cta: 'Explore Collection',
        color: 'text-white'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2940&auto=format&fit=crop',
        title: 'New Arrivals',
        subtitle: 'Latest trends from top designers',
        cta: 'Shop Now',
        color: 'text-white'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2874&auto=format&fit=crop',
        title: 'Summer Vibes',
        subtitle: 'Light, breezy, and stylish',
        cta: 'View Trends',
        color: 'text-white'
    }
];

export default function HeroCarousel() {
    const [current, setCurrent] = useState(0);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const prev = () => setCurrent(curr => (curr === 0 ? SLIDES.length - 1 : curr - 1));
    const next = () => setCurrent(curr => (curr + 1) % SLIDES.length);

    return (
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl group">
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-16">
                        <div className={`transform transition-all duration-700 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <h2 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-2 shadow-sm">{slide.title}</h2>
                            <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-lg shadow-sm">{slide.subtitle}</p>
                            <button className="bg-gold text-midnight font-bold px-8 py-3 rounded-full hover:bg-white hover:scale-105 transition-all shadow-glow">
                                {slide.cta}
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white hover:text-midnight transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white hover:text-midnight transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-gold w-8' : 'bg-white/50 hover:bg-white'}`}
                    />
                ))}
            </div>
        </div>
    );
}
