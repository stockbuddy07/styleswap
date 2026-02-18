import React from 'react';

export default function Card({ children, className = '', hover = false, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl shadow-md ${hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer' : ''} ${className}`}
        >
            {children}
        </div>
    );
}
