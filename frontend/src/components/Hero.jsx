import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <main className="flex flex-col items-center justify-center h-full px-4 text-center">

            {/* Outline Text Title */}
            <h1
                className="font-bold uppercase tracking-wide text-6xl md:text-[96px] select-none"
                style={{
                    color: 'rgba(255, 255, 255, 0.25)',
                    WebkitTextStroke: '1px rgba(26, 26, 26, 0.9)',
                    textShadow: '0 6px 18px rgba(0, 0, 0, 0.45)'
                }}
            >
                Welcome to the MUSIC
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/90 font-light tracking-wide">
                To experience the Quality of the music
            </p>

            <Link to="/login" className="mt-12 px-10 py-3 bg-white text-black rounded-full font-bold text-base md:text-lg hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Sign in
            </Link>
        </main>
    );
};

export default Hero;
