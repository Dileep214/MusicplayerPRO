import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, LayoutDashboard, Music, X, Menu, History, Play } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

const NAV_LINKS_BASE = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/library', label: 'Library', icon: BookOpen },
    { path: '/profile', label: 'Profile', icon: User },
];

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const {
        user, formatUrl, recentlyPlayed, songs,
        setCurrentSongId, setIsPlaying, currentSongId, cleanName,
        setSelectedPlaylist, setSearchTerm
    } = useMusic();

    const isAdmin = React.useMemo(() =>
        user && user.role === 'admin' && user.email?.toLowerCase() === 'dileepkomarthi@gmail.com',
        [user]
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

                {/* Recently Played Section */}
                {(recentlyPlayed || []).length > 0 && (
                    <div className="px-3 pb-6 flex-1 overflow-hidden flex flex-col min-h-0">
                        <div className="px-4 mb-3 flex items-center gap-2 text-white/40">
                            <History className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Recently Played</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                            {recentlyPlayed.map(id => {
                                const song = songs.find(s => String(s._id) === String(id));
                                if (!song) return null;
                                const isActive = String(currentSongId) === String(song._id);

                                return (
                                    <button
                                        key={id}
                                        onClick={() => {
                                            setSelectedPlaylist(null);
                                            setSearchTerm('');
                                            setCurrentSongId(song._id);
                                            setIsPlaying(true);
                                            onClose();
                                        }}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group
                                            ${isActive ? 'bg-green-500/10 text-green-400' : 'text-white/50 hover:text-white hover:bg-white/5'}
                                        `}
                                    >
                                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 relative">
                                            <img
                                                src={formatUrl(song.coverImg)}
                                                alt=""
                                                className={`w-full h-full object-cover ${isActive ? 'opacity-50' : 'group-hover:opacity-50'}`}
                                            />
                                            {(isActive || true) && (
                                                <div className={`absolute inset-0 flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                    <Play className={`w-3 h-3 ${isActive ? 'fill-green-400 text-green-400' : 'fill-white text-white'}`} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-xs font-semibold truncate">{cleanName(song.title)}</p>
                                            <p className="text-[10px] opacity-60 truncate">{song.artist}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* User Info */}
                {user && (
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-purple-500 flex items-center justify-center overflow-hidden border border-white/10">
                                {user.profilePhoto ? (
                                    <img
                                        src={formatUrl(user.profilePhoto)}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-bold text-sm">
                                        {user.name?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-semibold truncate">
                                    {user.name || 'User'}
                                </p>
                                <p className="text-white/40 text-xs truncate">
                                    {user.email}
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
