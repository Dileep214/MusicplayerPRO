import React from 'react';

const InputField = ({ label, id, type = 'text', placeholder, value, onChange }) => {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-sm font-medium text-white/80 ml-1">
                {label}
            </label>
            <input
                type={type}
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
            />
        </div>
    );
};

export default InputField;
