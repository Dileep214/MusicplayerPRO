import { Link, useLocation } from 'react-router-dom';
import { Music, LayoutDashboard, Home, BookOpen, User, Search } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

const Navbar = () => {
    const location = useLocation();
    const { searchTerm, setSearchTerm } = useMusic();

    const userObj = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = userObj && userObj.role === 'admin' && userObj.email.toLowerCase() === 'dileepkomarthi@gmail.com';

    const navLinks = [
        { path: '/home', label: 'Home', icon: Home },
        { path: '/library', label: 'Library', icon: BookOpen },
        ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: LayoutDashboard }] : []),
        { path: '/profile', label: 'Profile', icon: User },
    ];

    const user = localStorage.getItem('user');

    return (
        <nav className="fixed top-0 left-0 w-full z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <Music className="w-5 h-5 text-[#0f0f1a]" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white">PRO<span className="text-green-500">MUSIC</span></span>
                </Link>

                {/* Search Bar - Only for logged in users */}
                {user && (
                    <div className="flex-1 max-w-md relative group hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-green-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find songs, artists..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:bg-white/10 transition-all placeholder:text-white/20"
                        />
                    </div>
                )}

                <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 flex-shrink-0">
                    {user && navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${location.pathname === link.path
                                ? 'bg-green-500 text-[#0f0f1a] shadow-lg shadow-green-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <link.icon className="w-4 h-4" />
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex gap-4 flex-shrink-0">
                    <button className="md:hidden p-2 text-white bg-white/5 rounded-lg border border-white/10">
                        <LayoutDashboard className="w-5 h-5" />
                    </button>
                    {user ? (
                        <Link
                            to="/login"
                            onClick={() => localStorage.removeItem('user')}
                            className="px-6 py-2.5 rounded-xl bg-white text-[#0f0f1a] text-sm font-bold hover:bg-gray-200 transition-colors"
                        >
                            Logout
                        </Link>
                    ) : (
                        location.pathname === '/' ? (
                            <Link to="/signup" className="px-6 py-2.5 rounded-xl bg-white text-[#0f0f1a] text-sm font-bold hover:bg-gray-200 transition-colors">
                                Sign Up
                            </Link>
                        ) : (
                            <Link to="/login" className="px-6 py-2.5 rounded-xl bg-white text-[#0f0f1a] text-sm font-bold hover:bg-gray-200 transition-colors">
                                Sign In
                            </Link>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
