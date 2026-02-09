import React from 'react';

const BackgroundWrapper = ({ children }) => {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black text-white selection:bg-white selection:text-black font-sans">

            {/* 
                BACKGROUND IMAGE
            */}
            <img src="/background.jpg" alt="Music Background" className="absolute inset-0 w-full h-full object-cover opacity-60" />

            {/* 
            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_center,_#4a4a4a_0%,_#000000_100%)] opacity-80" /> 
            */}

            {/* Dark overlay to ensure text readability & cinematic depth */}
            <div className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-[2px]" />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    );
};

export default BackgroundWrapper;
