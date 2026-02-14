import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, LayoutDashboard, Music, X, Menu } from 'lucide-react';

const NAV_LINKS_BASE = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/library', label: 'Library', icon: BookOpen },
    { path: '/profile', label: 'Profile', icon: User },
];

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    const userObj = React.useMemo(() => {
        try {
            const user = localStorage.getItem('user');
            return JSON.parse(user || 'null');
        } catch {
            return null;
        }
    }, []);

    const isAdmin = React.useMemo(() =>
        userObj && userObj.role === 'admin' && userObj.email?.toLowerCase() === 'dileepkomarthi@gmail.com',
        [userObj]
    );

    const navLinks = React.useMemo(() => {
        if (!isAdmin) return NAV_LINKS_BASE;
        const links = [...NAV_LINKS_BASE];
        links.splice(2, 0, { path: '/admin', label: 'Admin', icon: LayoutDashboard });
        return links;
    }, [isAdmin]);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full bg-white/[0.02] backdrop-blur-2xl border-r border-white/10
                    flex flex-col z-50 transition-transform duration-300 ease-out
                    w-64 lg:w-64
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo & Close Button */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <Link to="/home" className="flex items-center gap-3 group" onClick={onClose}>
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                            <Music className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-white uppercase">
                            MUSIC<span className="text-green-400">PLAYER</span>
                        </span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white/60" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;

                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-4 px-4 py-3 rounded-xl
                                    font-semibold text-sm transition-all duration-200
                                    ${isActive
                                        ? 'bg-white/10 text-white shadow-lg'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-green-400' : ''}`} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                {userObj && (
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {userObj.name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-semibold truncate">
                                    {userObj.name || 'User'}
                                </p>
                                <p className="text-white/40 text-xs truncate">
                                    {userObj.email}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
