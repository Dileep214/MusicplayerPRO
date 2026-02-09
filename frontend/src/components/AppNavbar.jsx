import React from 'react';
import { Link } from 'react-router-dom';

const AppNavbar = ({ showProfile = false }) => {
    return (
        <nav className="absolute top-0 left-0 w-full z-20 flex justify-between items-center px-6 py-4 md:px-8 bg-black/20 backdrop-blur-sm">
            <div className="text-xl font-extrabold tracking-widest uppercase text-white">
                LOGO
            </div>
            {showProfile && (
                <Link
                    to="/profile"
                    className="px-6 py-2 rounded-full border border-white/25 bg-white/5 backdrop-blur-sm text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                    Profile
                </Link>
            )}
        </nav>
    );
};

export default AppNavbar;
