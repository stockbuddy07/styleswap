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
    const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

    const sizes = {
        sm: 'px-3 py-2 text-sm min-h-[36px]',
        md: 'px-5 py-3 text-sm min-h-[48px]',
        lg: 'px-8 py-4 text-base min-h-[52px]',
    };

    const variants = {
        primary: 'bg-gold text-white hover:bg-yellow-600 focus:ring-gold',
        secondary: 'bg-midnight text-white hover:bg-blue-900 focus:ring-midnight',
        outline: 'border-2 border-midnight text-midnight hover:bg-midnight hover:text-white focus:ring-midnight',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        ghost: 'text-midnight hover:bg-gray-100 focus:ring-gray-300',
        'outline-gold': 'border-2 border-gold text-gold hover:bg-gold hover:text-white focus:ring-gold',
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
