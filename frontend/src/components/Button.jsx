import React from 'react';

const Button = ({ children, type = 'button', onClick, className = '', disabled = false }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`w-full py-3.5 px-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-transform transform active:scale-[0.98] shadow-lg mt-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
