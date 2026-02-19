import React from 'react';

export default function Loader({ message = 'Loading...', fullPage = true }) {
    const loaderContent = (
        <div className="flex flex-col items-center gap-6">
            <div className="relative w-20 h-20">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-100 opacity-30"></div>
                {/* Spinning Gradient Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold border-r-gold animate-spin"></div>
                {/* Inner Pulse */}
                <div className="absolute inset-4 rounded-full bg-midnight animate-pulse flex items-center justify-center">
                    <span className="text-xl font-playfair font-bold text-white">S</span>
                </div>
            </div>
            {message && (
                <div className="text-center space-y-2">
                    <p className="text-midnight font-playfair font-bold text-lg tracking-wide animate-pulse">
                        {message}
                    </p>
                    <div className="flex justify-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            )}
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md transition-all duration-300">
                {loaderContent}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-20">
            {loaderContent}
        </div>
    );
}
