import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Link } from 'react-router-dom';
import { Music, Sparkles } from 'lucide-react';

const HomePage = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = userData.name || 'Guest';

    return (
        <MainLayout>
            <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] px-4">
                <div className="text-center max-w-2xl">
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-purple-600 rounded-full blur-3xl opacity-30 animate-pulse" />
                            <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                <Music className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
                        Welcome back,
                        <span className="block bg-gradient-to-r from-green-400 to-purple-500 bg-clip-text text-transparent">
                            {userName}
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/60 font-medium mb-12">
                        Your music, your way. Start exploring your library.
                    </p>

                    <Link
                        to="/library"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl hover:shadow-white/20"
                    >
                        <Sparkles className="w-5 h-5" />
                        Go to Library
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
};

export default HomePage;
