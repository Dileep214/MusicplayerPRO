import React from 'react';
import { Link } from 'react-router-dom';

const AuthNavbar = ({ label = "Already have an account?", linkText = "Sign in", linkPath = "/login" }) => {
    return (
        <nav className="absolute top-0 left-0 w-full z-20 flex justify-between items-center px-6 py-4 md:px-12">
            <Link to="/" className="text-xl font-extrabold tracking-widest uppercase text-white hover:opacity-80 transition-opacity">
                LOGO
            </Link>
            <div className="text-sm font-medium text-white/70">
                {label} <Link to={linkPath} className="text-white hover:underline">{linkText}</Link>
            </div>
        </nav>
    );
};

export default AuthNavbar;
