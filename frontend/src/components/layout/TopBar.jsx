import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, LogOut } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

const TopBar = ({ onMenuClick }) => {
    const location = useLocation();
    const { searchTerm, setSearchTerm, stopPlayback } = useMusic();

    const user = localStorage.getItem('user');
    const showSearch = user && location.pathname === '/library';

    const handleLogout = () => {
        stopPlayback();
        localStorage.removeItem('user');
    };

    return (
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/[0.02] backdrop-blur-2xl border-b border-white/10 z-30 px-4 lg:px-6">
            <div className="h-full flex items-center justify-between gap-4">

                {/* Left: Menu Button (Mobile) + Search */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6 text-white" />
                    </button>

                    {showSearch && (
                        <div className="flex-1 max-w-md relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search songs, artists, playlists..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white/10 transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* Right: User Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {user && (
                        <Link
                            to="/login"
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-semibold transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
