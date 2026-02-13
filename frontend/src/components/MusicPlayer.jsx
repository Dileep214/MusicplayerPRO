import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';

const MusicPlayer = React.memo(() => {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        progress,
        togglePlay,
        handleNext,
        handlePrevious,
        handleSeek,
        isShuffle,
        setIsShuffle,
        repeatMode,
        setRepeatMode,
        volume,
        setVolume,
        setShowNowPlayingView,
        setSelectedPlaylist,
        setIsAllSongsView,
        setSearchTerm,
        showNowPlayingView,
        formatUrl
    } = useMusic();

    const navigate = useNavigate();

    const formatTime = useCallback((time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const handleInfoClick = useCallback(() => {
        setSelectedPlaylist(null);
        setIsAllSongsView(true);
        setShowNowPlayingView(true);
        setSearchTerm('');
        navigate('/library');
    }, [setSelectedPlaylist, setIsAllSongsView, setShowNowPlayingView, setSearchTerm, navigate]);

    const handleShuffleToggle = useCallback(() => {
        setIsShuffle(!isShuffle);
    }, [isShuffle, setIsShuffle]);

    const handleRepeatToggle = useCallback(() => {
        const modes = ['none', 'all', 'one'];
        const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
        setRepeatMode(next);
    }, [repeatMode, setRepeatMode]);

    const handleVolumeChange = useCallback((e) => {
        setVolume(parseFloat(e.target.value));
    }, [setVolume]);

    const handleMuteToggle = useCallback(() => {
        setVolume(volume > 0 ? 0 : 0.7);
    }, [volume, setVolume]);

    if (!currentSong || showNowPlayingView) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 px-6 py-[14px] z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">

                {/* Song Info - Left */}
                <div
                    onClick={handleInfoClick}
                    className="flex items-center gap-4 w-64 hidden md:flex group cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden border border-white/10 flex-shrink-0 relative">
                        {currentSong?.coverImg ? (
                            <img
                                src={formatUrl(currentSong.coverImg)}
                                alt=""
                                loading="lazy"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-white/5" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{currentSong?.title || "No song selected"}</span>
                        <span className="text-xs text-white/40 truncate">{currentSong?.artist || "Select a track"}</span>
                    </div>
                </div>

                {/* Main Player Area */}
                <div className="flex-1 max-w-2xl flex flex-col gap-1">
                    {/* Progress bar container */}
                    <div className="flex flex-col gap-1.5">
                        <div className="group relative h-1.5 flex items-center">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="0.1"
                                value={progress || 0}
                                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-green-400 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                        {/* Time below Progress Bar */}
                        <div className="flex justify-between px-0.5">
                            <span className="text-[10px] text-white/40 font-medium tabular-nums">{formatTime(currentTime)}</span>
                            <span className="text-[10px] text-white/40 font-medium tabular-nums">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-8 mt-1">
                        {/* Shuffle */}
                        <button
                            onClick={handleShuffleToggle}
                            className={`transition-all ${isShuffle ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-white/40 hover:text-white/60'}`}
                            title="Shuffle"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 3 21 3 21 8"></polyline>
                                <line x1="4" y1="20" x2="21" y2="3"></line>
                                <polyline points="21 16 21 21 16 21"></polyline>
                                <line x1="15" y1="15" x2="21" y2="21"></line>
                                <line x1="4" y1="4" x2="9" y2="9"></line>
                            </svg>
                        </button>

                        {/* Previous */}
                        <button
                            onClick={handlePrevious}
                            className="text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                            </svg>
                        </button>

                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            {isPlaying ? (
                                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>

                        {/* Next */}
                        <button
                            onClick={() => handleNext()}
                            className="text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                            </svg>
                        </button>

                        {/* Repeat */}
                        <button
                            onClick={handleRepeatToggle}
                            className={`transition-all relative ${repeatMode !== 'none' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-white/40 hover:text-white/60'}`}
                            title="Repeat"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="17 1 21 5 17 9"></polyline>
                                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                <polyline points="7 23 3 19 7 15"></polyline>
                                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                            </svg>
                            {repeatMode === 'one' && (
                                <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-blue-500 text-white w-3 h-3 rounded-full flex items-center justify-center">1</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Volume Controller - Right */}
                <div className="flex items-center gap-3 w-40 hidden lg:flex group">
                    <button
                        onClick={handleMuteToggle}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        {volume === 0 ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                                <line x1="23" y1="9" x2="17" y2="15"></line>
                                <line x1="17" y1="9" x2="23" y2="15"></line>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                        )}
                    </button>
                    <div className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden group-hover:h-1.5 transition-all">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                            className="absolute left-0 top-0 h-full bg-white/60 transition-all"
                            style={{ width: `${volume * 100}%` }}
                        ></div>
                    </div>
                </div>

            </div>
        </div>
    );
});

export default MusicPlayer;
