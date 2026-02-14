import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MusicPlayer from '../MusicPlayer';
import { useMusic } from '../../context/MusicContext';

const MainLayout = ({ children, onPlayerClick, showNowPlaying = false }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { currentSong } = useMusic();

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="lg:ml-64 flex flex-col h-full">
                {/* Top Bar */}
                <TopBar onMenuClick={() => setSidebarOpen(true)} />

                {/* Scrollable Content */}
                <main
                    className={`
                        flex-1 overflow-y-auto overflow-x-hidden
                        pt-16 
                        ${currentSong && !showNowPlaying ? 'pb-24' : 'pb-6'}
                    `}
                >
                    <div className="relative z-10">
                        {children}
                    </div>
                </main>

                {/* Bottom Player Bar - Hidden when Now Playing is active */}
                {!showNowPlaying && <MusicPlayer onPlayerClick={onPlayerClick} />}
            </div>
        </div>
    );
};

export default MainLayout;
