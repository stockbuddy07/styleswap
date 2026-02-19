import React from 'react';

export default function Loader({ message = 'Loading...', fullPage = true }) {
    if (fullPage) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-lightGold"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-gold border-t-transparent animate-spin"></div>
                    </div>
                    {message && <p className="text-midnight font-medium text-sm">{message}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-4 border-lightGold"></div>
                <div className="absolute inset-0 rounded-full border-4 border-gold border-t-transparent animate-spin"></div>
            </div>
        </div>
    );
}
