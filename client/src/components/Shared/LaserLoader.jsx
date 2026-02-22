import React, { useEffect, useState } from 'react';

/**
 * LaserLoader Component
 * Creates a premium "Laser Flow" inspired preloader with glowing light streaks 
 * and a pulsating luxury logo on a deep midnight background.
 */
export default function LaserLoader({ onFadeOut }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Auto-trigger fade out after animation duration
        const timer = setTimeout(() => {
            setIsExiting(true);
            if (onFadeOut) setTimeout(onFadeOut, 800); // Allow fade animation to complete
        }, 3000);

        return () => clearTimeout(timer);
    }, [onFadeOut]);

    return (
        <div className={`fixed inset-0 z-[999] bg-midnight flex items-center justify-center overflow-hidden transition-opacity duration-1000 ease-in-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            {/* Background Laser Streaks */}
            <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Horizontal Streaks */}
                    {[...Array(6)].map((_, i) => (
                        <rect
                            key={`h-${i}`}
                            x="-100"
                            y={15 + i * 15}
                            width="100"
                            height="0.2"
                            fill="url(#laserGradient)"
                            className="animate-laser-h"
                            style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${2 + i * 0.5}s` }}
                        />
                    ))}
                    {/* Vertical Streaks */}
                    {[...Array(6)].map((_, i) => (
                        <rect
                            key={`v-${i}`}
                            x={15 + i * 15}
                            y="-100"
                            width="0.2"
                            height="100"
                            fill="url(#laserGradientV)"
                            className="animate-laser-v"
                            style={{ animationDelay: `${i * 0.3}s`, animationDuration: `${2.5 + i * 0.4}s` }}
                        />
                    ))}
                    <defs>
                        <linearGradient id="laserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
                            <stop offset="50%" stopColor="#D4AF37" stopOpacity="1" />
                            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="laserGradientV" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
                            <stop offset="50%" stopColor="#D4AF37" stopOpacity="1" />
                            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Central Luxury Logo */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-gold rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.4)] animate-luxury-pulse">
                    <span className="text-midnight font-playfair font-bold text-4xl">S</span>
                </div>
                <div className="flex flex-col items-center">
                    <h1 className="text-white font-playfair font-black text-2xl tracking-[0.3em] uppercase opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        Style<span className="text-gold">Swap</span>
                    </h1>
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mt-2 scale-x-0 animate-expand-width" style={{ animationDelay: '1s' }} />
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em] mt-4 opacity-0 animate-fade-in" style={{ animationDelay: '1.5s' }}>
                        The Art of Luxury
                    </p>
                </div>
            </div>

            {/* CSS for specialized animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes laser-h {
                    0% { transform: translateX(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(200%); opacity: 0; }
                }
                @keyframes laser-v {
                    0% { transform: translateY(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(200%); opacity: 0; }
                }
                @keyframes luxury-pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 50px rgba(212,175,55,0.4); }
                    50% { transform: scale(1.05); box-shadow: 0 0 80px rgba(212,175,55,0.6); }
                }
                @keyframes fade-in-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes expand-width {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-laser-h { animation: laser-h linear infinite; }
                .animate-laser-v { animation: laser-v linear infinite; }
                .animate-luxury-pulse { animation: luxury-pulse 3s ease-in-out infinite; }
                .animate-fade-in-up { animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-expand-width { animation: expand-width 2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in { animation: fade-in 2s ease-out forwards; }
            `}} />
        </div>
    );
}
