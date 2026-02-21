import React, { useCallback } from 'react';
import { useMusic } from '../context/MusicContext';
import { X, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart } from 'lucide-react';

const NowPlayingView = ({ onClose }) => {
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
        favorites,
        toggleFavorite,
        formatUrl,
        isBuffering
    } = useMusic();

    const formatTime = useCallback((time) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const handleShuffleToggle = useCallback(() => {
        setIsShuffle(!isShuffle);
    }, [isShuffle, setIsShuffle]);

    const handleRepeatToggle = useCallback(() => {
        const modes = ['none', 'all', 'one'];
        const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
        setRepeatMode(next);
    }, [repeatMode, setRepeatMode]);

    const isFavorite = favorites.some(id => String(id) === String(currentSong?._id));

    if (!currentSong) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-black z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 lg:p-6">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full transition-all text-white/80 hover:text-white"
                    aria-label="Back"
                >
                    <X className="w-6 h-6" />
                    <span className="text-sm font-semibold hidden sm:inline">Back</span>
                </button>
                <h2 className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">
                    Now Playing
                </h2>
                <div className="w-12 h-12 flex items-center justify-center">
                    {/* Placeholder for symmetry or an options button */}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 lg:px-8 pb-8">
                {/* Album Art */}
                <div className="w-full max-w-md aspect-square mb-8 rounded-2xl overflow-hidden shadow-2xl">
                    {currentSong?.coverImg ? (
                        <div className="relative w-full h-full group">
                            <img
                                src={formatUrl(currentSong.coverImg)}
                                alt={currentSong.title}
                                className={`w-full h-full object-cover transition-all duration-700 ${isBuffering ? 'scale-110 blur-md opacity-50' : 'scale-100 blur-0 opacity-100'}`}
                            />
                            {isBuffering && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                                    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                                        <div className="h-full bg-green-500 animate-[loading_1.5s_infinite_linear]" style={{ width: '40%' }}></div>
                                    </div>
                                    <span className="text-white font-medium animate-pulse tracking-widest text-sm uppercase">
                                        Please wait...
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-purple-600/20 flex items-center justify-center">
                            <span className="text-white/20 text-6xl font-bold">MUSIC</span>
                        </div>
                    )}
                </div>

                {/* Song Info */}
                <div className="w-full max-w-2xl text-center mb-8">
                    <h1 className="text-3xl lg:text-5xl font-black text-white mb-3 truncate">
                        {currentSong?.title || "Unknown Title"}
                    </h1>
                    <p className="text-lg lg:text-xl text-white/60 truncate">
                        {currentSong?.artist || "Unknown Artist"}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-2xl mb-8 space-y-3">
                    <div className="relative h-2 bg-white/10 rounded-full group cursor-pointer">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={progress || 0}
                            onChange={(e) => handleSeek(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            aria-label="Seek"
                        />
                        <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                        <div
                            className="absolute h-4 w-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-y-1/4"
                            style={{ left: `calc(${progress}% - 8px)` }}
                        />
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs text-white/40 font-bold tabular-nums">
                            {formatTime(currentTime)}
                        </span>
                        <span className="text-xs text-white/40 font-bold tabular-nums">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 mb-6">
                    <button
                        onClick={handleShuffleToggle}
                        className={`p-3 rounded-full transition-all ${isShuffle
                            ? 'text-green-400 bg-green-500/20'
                            : 'text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                        aria-label="Shuffle"
                    >
                        <Shuffle className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handlePrevious}
                        className="p-3 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
                        aria-label="Previous"
                    >
                        <SkipBack className="w-7 h-7 fill-current" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <Pause className="w-8 h-8 text-black fill-current" />
                        ) : (
                            <Play className="w-8 h-8 text-black fill-current ml-1" />
                        )}
                    </button>

                    <button
                        onClick={() => handleNext()}
                        className="p-3 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
                        aria-label="Next"
                    >
                        <SkipForward className="w-7 h-7 fill-current" />
                    </button>

                    <button
                        onClick={handleRepeatToggle}
                        className={`p-3 rounded-full relative transition-all ${repeatMode !== 'none'
                            ? 'text-green-400 bg-green-500/20'
                            : 'text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                        aria-label="Repeat"
                    >
                        <Repeat className="w-5 h-5" />
                        {repeatMode === 'one' && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                1
                            </span>
                        )}
                    </button>
                </div>

                {/* Favorite Button */}
                <button
                    onClick={() => toggleFavorite(currentSong._id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${isFavorite
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
            </div>
        </div>
    );
};

export default NowPlayingView;
