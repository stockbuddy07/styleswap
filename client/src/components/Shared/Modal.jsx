import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md', hideHeader = false, className = 'bg-white', headerClassName = '' }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 md:p-10 transition-all duration-300"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={onClose} // Close on clicking any part of the backdrop
        >
            <div
                className={`modal-content relative rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full ${sizes[size]} max-h-[90vh] flex flex-col scale-100 animate-in fade-in zoom-in duration-300 ${className}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
            >
                {!hideHeader && (
                    <div className={`flex items-center justify-between px-6 sm:px-10 py-5 sm:py-8 border-b border-gray-100/50 ${headerClassName}`}>
                        {title && (
                            <h2 id="modal-title" className="text-xl sm:text-2xl font-playfair font-black text-midnight tracking-tight">
                                {title}
                            </h2>
                        )}
                        <button
                            onClick={onClose}
                            className="ml-auto p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-midnight"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
