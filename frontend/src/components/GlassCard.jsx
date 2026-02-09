import React from 'react';

const GlassCard = ({ children, className = '' }) => {
    return (
        <div className={`relative w-full max-w-md p-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden ${className}`}>
            {children}
        </div>
    );
};

export default GlassCard;
