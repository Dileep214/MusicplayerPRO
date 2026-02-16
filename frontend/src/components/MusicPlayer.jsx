import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX } from 'lucide-react';

const MusicPlayer = React.memo(({ onPlayerClick }) => {
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
        formatUrl,
        isBuffering
    } = useMusic();

    const navigate = useNavigate();

    const formatTime = useCallback((time) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const handleInfoClick = useCallback((e) => {
        e.stopPropagation();
        navigate('/library');
    }, [navigate]);

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

    const handlePlayerClick = useCallback(() => {
        if (onPlayerClick) {
            onPlayerClick();
        }
    }, [onPlayerClick]);

    if (!currentSong) return null;

    return (
        <div
            onClick={handlePlayerClick}
            className="fixed bottom-0 left-0 lg:left-64 right-0 h-20 bg-white/[0.02] backdrop-blur-2xl border-t border-white/10 z-40 cursor-pointer hover:bg-white/[0.05] transition-colors"
        >
            {isBuffering && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
                    <div className="h-full bg-green-500 animate-[loading_1.5s_infinite_linear]" style={{ width: '30%' }}></div>
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-green-400 font-medium animate-pulse">
                        Please wait...
                    </div>
                </div>
            )}
            <div className={`h-full px-4 lg:px-6 flex items-center gap-4 ${isBuffering ? 'opacity-50' : ''}`}>

                {/* Left: Song Info */}
                <div
                    onClick={handleInfoClick}
                    className="flex items-center gap-3 w-full md:w-64 lg:w-80 min-w-0 cursor-pointer group"
                >
                    <div className="w-14 h-14 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
                        {currentSong?.coverImg ? (
                            <img
                                src={formatUrl(currentSong.coverImg)}
                                alt={currentSong.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-bold">
                                MUSIC
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate group-hover:text-green-400 transition-colors">
                            {currentSong?.title || "Unknown Title"}
                        </p>
                        <p className="text-white/50 text-xs truncate">
                            {currentSong?.artist || "Unknown Artist"}
                        </p>
                    </div>
                </div>

                {/* Center: Player Controls (Hidden on Mobile) */}
                <div className="hidden md:flex flex-col items-center flex-1 gap-2 max-w-2xl" onClick={(e) => e.stopPropagation()}>
                    {/* Control Buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleShuffleToggle}
                            className={`p-2 rounded-full transition-all ${isShuffle
                                ? 'text-green-400 hover:text-green-300'
                                : 'text-white/40 hover:text-white/60'
                                }`}
                            aria-label="Shuffle"
                        >
                            <Shuffle className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handlePrevious}
                            className="p-2 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
                            aria-label="Previous"
                        >
                            <SkipBack className="w-5 h-5 fill-current" />
                        </button>

                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5 text-black fill-current" />
                            ) : (
                                <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                            )}
                        </button>

                        <button
                            onClick={() => handleNext()}
                            className="p-2 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
                            aria-label="Next"
                        >
                            <SkipForward className="w-5 h-5 fill-current" />
                        </button>

                        <button
                            onClick={handleRepeatToggle}
                            className={`p-2 rounded-full relative transition-all ${repeatMode !== 'none'
                                ? 'text-green-400 hover:text-green-300'
                                : 'text-white/40 hover:text-white/60'
                                }`}
                            aria-label="Repeat"
                        >
                            <Repeat className="w-4 h-4" />
                            {repeatMode === 'one' && (
                                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                                    1
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-2">
                        <span className="text-[10px] text-white/40 font-medium tabular-nums min-w-[35px]">
                            {formatTime(currentTime)}
                        </span>
                        <div className="flex-1 group relative h-1 flex items-center">
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
                            <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-purple-500 transition-all duration-100"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div
                                className="absolute h-3 w-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                style={{ left: `calc(${progress}% - 6px)` }}
                            />
                        </div>
                        <span className="text-[10px] text-white/40 font-medium tabular-nums min-w-[35px] text-right">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Mobile: Simple Play/Next */}
                <div className="flex md:hidden items-center gap-3 ml-auto" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 text-black fill-current" />
                        ) : (
                            <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                        )}
                    </button>
                    <button
                        onClick={() => handleNext()}
                        className="text-white/80 hover:text-white p-2"
                        aria-label="Next"
                    >
                        <SkipForward className="w-6 h-6" />
                    </button>
                </div>

                {/* Right: Volume (Desktop Only) */}
                <div className="hidden lg:flex items-center gap-3 w-32" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={handleMuteToggle}
                        className="text-white/40 hover:text-white transition-colors"
                        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                    >
                        {volume === 0 ? (
                            <VolumeX className="w-5 h-5" />
                        ) : (
                            <Volume2 className="w-5 h-5" />
                        )}
                    </button>
                    <div className="flex-1 group relative h-1 flex items-center">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            aria-label="Volume"
                        />
                        <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="absolute left-0 top-0 h-full bg-white/60 transition-all"
                                style={{ width: `${volume * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
});

export default MusicPlayer;
