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
            ref={overlayRef}
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div
                className={`modal-content rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col ${className}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {!hideHeader && (
                    <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 ${headerClassName}`}>
                        {title && (
                            <h2 id="modal-title" className="text-xl font-playfair font-semibold">
                                {title}
                            </h2>
                        )}
                        <button
                            onClick={onClose}
                            className="ml-auto p-2 rounded-lg hover:bg-white/10 transition-colors text-inherit opacity-70 hover:opacity-100"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
                <div className="overflow-y-auto flex-1 px-6 py-4 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
