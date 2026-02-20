import React from 'react';

export default function Button({
    children,
    variant = 'primary',
    onClick,
    disabled = false,
    loading = false,
    type = 'button',
    className = '',
    fullWidth = false,
    size = 'md',
}) {
    const base = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 relative overflow-hidden group';

    const sizes = {
        sm: 'px-4 py-2 text-xs min-h-[40px]',
        md: 'px-6 py-3.5 text-sm min-h-[52px]',
        lg: 'px-10 py-5 text-base min-h-[60px]',
    };

    const variants = {
        primary: 'bg-gold text-midnight shadow-[0_4px_20px_-4px_rgba(212,175,55,0.4)] hover:shadow-[0_8px_30px_-4px_rgba(212,175,55,0.6)] hover:-translate-y-1',
        secondary: 'bg-midnight text-white hover:bg-gray-900 shadow-xl hover:-translate-y-1 border border-white/10',
        outline: 'border-2 border-midnight text-midnight hover:bg-midnight hover:text-white',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
        ghost: 'text-midnight hover:bg-gray-100',
        'outline-gold': 'border-2 border-gold text-gold hover:bg-gold hover:text-midnight hover:shadow-glow',
        glass: 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md shadow-xl',
        'gold-glow': 'bg-gold text-midnight shadow-glow hover:scale-105 active:scale-95',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </button>
    );
}
