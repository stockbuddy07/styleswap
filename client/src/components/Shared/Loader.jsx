import React from 'react';

/**
 * Enhanced Loader Component
 * Incorporates the "Laser Flow" luxury aesthetic for a premium loading experience.
 */
export default function Loader({ message = 'Accessing StyleSwap...', fullPage = true }) {
    const loaderContent = (
        <div className="relative flex flex-col items-center justify-center gap-8">
            {/* Background Laser Streaks (Subtle for component level) */}
            <div className="absolute inset-0 -z-10 w-48 h-48 blur-3xl opacity-20 bg-gold/30 rounded-full animate-pulse"></div>

            <div className="relative">
                {/* Outer Rotating Laser Ring */}
                <div className="absolute -inset-4 rounded-full border border-gold/10 scale-110"></div>
                <div className="absolute -inset-4 rounded-full border-2 border-transparent border-t-gold/40 animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute -inset-2 rounded-full border border-gold/5 animate-[spin_2s_linear_infinite_reverse]"></div>

                {/* Central Identity Pulse */}
                <div className="relative w-20 h-20 bg-midnight-deep rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.2)] border border-white/5 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-3xl font-playfair font-black text-white z-10 animate-luxury-pulse">S</span>

                    {/* Laser Sweep Effect */}
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-gold/10 to-transparent skew-x-12 animate-laser-sweep"></div>
                </div>
            </div>

            {message && (
                <div className="flex flex-col items-center gap-2">
                    <p className="font-playfair text-midnight font-bold text-lg tracking-[0.2em] uppercase animate-fade-in-up">
                        {message}
                    </p>
                    <div className="flex gap-1.5 pt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gold/80 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes luxury-pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                @keyframes laser-sweep {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                @keyframes fade-in-up {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-laser-sweep { animation: laser-sweep 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
                .animate-luxury-pulse { animation: luxury-pulse 2s ease-in-out infinite; }
                .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
            `}} />
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl animate-fade-in">
                {loaderContent}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-32 animate-fade-in">
            {loaderContent}
        </div>
    );
}
