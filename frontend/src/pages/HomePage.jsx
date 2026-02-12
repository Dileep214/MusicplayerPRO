import React from 'react';
import BackgroundWrapper from '../components/BackgroundWrapper';
import Navbar from '../components/Navbar';
import { useNavigate, Link } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = userData.name || 'Guest';

    return (
        <BackgroundWrapper>
            <Navbar />

            {/* Main Content */}
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="text-center">
                    <h1
                        className="font-bold uppercase tracking-wide text-6xl md:text-[96px] select-none mb-8"
                        style={{
                            color: 'rgba(255, 255, 255, 0.25)',
                            WebkitTextStroke: '1px rgba(26, 26, 26, 0.9)',
                            textShadow: '0 6px 18px rgba(0, 0, 0, 0.45)'
                        }}
                    >
                        Hi! {userName}
                    </h1>

                    <p className="text-lg md:text-xl text-white/90 font-light tracking-wide mb-8">
                        Welcome to MusicPlayerPRO
                    </p>

                    <Link
                        to="/library"
                        className="inline-block px-10 py-3 bg-white text-black rounded-full font-bold text-base md:text-lg hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        Go to Music Library
                    </Link>
                </div>
            </div>
        </BackgroundWrapper>
    );
};

export default HomePage;
