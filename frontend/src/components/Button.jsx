import React from 'react';

const Button = ({ children, type = 'button', onClick, className = '' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`w-full py-3.5 px-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-transform transform active:scale-[0.98] shadow-lg mt-2 ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
