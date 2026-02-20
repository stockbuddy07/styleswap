import React, { forwardRef } from 'react';

const Input = forwardRef(function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    icon: Icon,
    iconRight: IconRight,
    onIconRightClick,
    className = '',
    inputClassName = '',
    required = false,
    disabled = false,
    min,
    max,
    step,
    rows,
    ...props
}, ref) {
    const inputClass = `w-full border rounded-xl px-5 py-3.5 focus:outline-none focus:ring-4 transition-all duration-300 min-h-[52px] ${error
        ? 'border-red-400 focus:ring-red-400/10'
        : 'border-gray-200 focus:ring-gold/10 focus:border-gold shadow-sm'
        } ${Icon ? 'pl-12' : ''} ${IconRight ? 'pr-12' : ''} ${disabled ? 'bg-gray-50/50 cursor-not-allowed opacity-60' : ''} ${inputClassName || 'bg-white/70 backdrop-blur-sm text-midnight'}`;

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className={`text-[10px] uppercase font-black tracking-widest ${inputClassName?.includes('text-white') ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${inputClassName?.includes('text-white') ? 'text-gray-400' : 'text-gray-400'}`}>
                        <Icon size={18} />
                    </div>
                )}
                {type === 'textarea' ? (
                    <textarea
                        ref={ref}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={rows || 4}
                        className={`${inputClass} min-h-[100px] resize-none`}
                        {...props}
                    />
                ) : (
                    <input
                        ref={ref}
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        min={min}
                        max={max}
                        step={step}
                        className={inputClass}
                        {...props}
                    />
                )}
                {IconRight && (
                    <button
                        type="button"
                        onClick={onIconRightClick}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <IconRight size={18} />
                    </button>
                )}
            </div>
            {error && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
});

export default Input;
