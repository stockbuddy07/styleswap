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
    required = false,
    disabled = false,
    min,
    max,
    step,
    rows,
    ...props
}, ref) {
    const inputClass = `w-full border rounded-lg px-4 py-3 text-darkGray bg-white focus:outline-none focus:ring-2 transition-all duration-200 min-h-[48px] ${error
            ? 'border-red-400 focus:ring-red-300'
            : 'border-gray-300 focus:ring-gold focus:border-transparent'
        } ${Icon ? 'pl-11' : ''} ${IconRight ? 'pr-11' : ''} ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`;

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-darkGray">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
