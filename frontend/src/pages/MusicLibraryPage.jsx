import React, { useState, useEffect } from 'react';
import { Music, ChevronLeft, Shuffle, RotateCcw, Play, Pause, SkipBack, SkipForward, Repeat, Heart } from 'lucide-react';
import BackgroundWrapper from '../components/BackgroundWrapper';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import SongItem from '../components/SongItem';
import MusicPlayer from '../components/MusicPlayer';

import { useMusic } from '../context/MusicContext';
import API_URL from '../api/config';

const MusicLibraryPage = () => {
    const {
        songs, setSongs,
        playlists, setPlaylists,
        currentSongId, setCurrentSongId,
        currentSong,
        isPlaying, setIsPlaying,
        currentTime, duration, progress,
        togglePlay, handleNext, handlePrevious, handleSeek,
        skipForward, skipBackward,
        selectedPlaylist, setSelectedPlaylist,
        isAllSongsView, setIsAllSongsView,
        searchTerm, setSearchTerm,
        showNowPlayingView, setShowNowPlayingView,
        filteredSongs,
        isShuffle, setIsShuffle,
        repeatMode, setRepeatMode,
        volume, setVolume,
        favorites, toggleFavorite
    } = useMusic();

    const formatTime = (time) => {
        if (!time) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Generate static waveform bars for the visualizer
    const bars = Array.from({ length: 40 }, (_, i) => ({
        height: Math.random() * 40 + 20,
        opacity: Math.random() * 0.5 + 0.3
    }));

    const [quoteIndex, setQuoteIndex] = useState(0);
    const quotes = [
        "Music is the universal language of mankind.",
        "Where words fail, music speaks.",
        "Life is better with music.",
        "Music is the art of thinking with sounds.",
        "Without music, life would be a mistake.",
        "Music is the soul of the universe.",
        "Let the music play.",
        "Music connects people.",
        "Rhythm is the heartbeat of life.",
        "Music washes away the dust of everyday life.",
        "In music we trust.",
        "Feel the beat.",
        "Music is my escape.",
        "Harmony is the goal.",
        "Melody is the essence of music.",
        "Music is healing.",
        "Dance across the edges of time.",
        "Lost in the rhythm.",
        "Music brings us together.",
        "Soundtrack of your life."
    ];

    useEffect(() => {
        // Check for stored rotation time
        const stored = localStorage.getItem('quoteRotation');
        let initialIndex = 0;
        const now = Date.now();
        const sixHours = 6 * 60 * 60 * 1000;

        if (stored) {
            const { index, timestamp } = JSON.parse(stored);
            if (now - timestamp < sixHours) {
                initialIndex = index;
            } else {
                // Time passed, calculate new index
                const elapsedSteps = Math.floor((now - timestamp) / sixHours);
                initialIndex = (index + elapsedSteps) % quotes.length;
            }
        } else {
            // First time setup
            initialIndex = Math.floor(Math.random() * quotes.length);
        }

        setQuoteIndex(initialIndex);
        localStorage.setItem('quoteRotation', JSON.stringify({ index: initialIndex, timestamp: now }));

        const interval = setInterval(() => {
            setQuoteIndex(prev => {
                const next = (prev + 1) % quotes.length;
                localStorage.setItem('quoteRotation', JSON.stringify({ index: next, timestamp: Date.now() }));
                return next;
            });
        }, sixHours);

        return () => clearInterval(interval);
    }, []);

    const handlePlaylistClick = (playlist) => {
        const playlistId = String(playlist._id || playlist);
        const selectedId = selectedPlaylist ? String(selectedPlaylist._id || selectedPlaylist) : null;

        if (selectedId === playlistId) {
            setSelectedPlaylist(null);
        } else {
            setSelectedPlaylist(playlist);
            setIsAllSongsView(false);
            setShowNowPlayingView(false); // Close Now Playing view if clicking playlist
        }
    };

    // Fetch data...
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Add timestamp to prevent caching
                const timestamp = new Date().getTime();
                const songsResponse = await fetch(`${API_URL}/api/songs?t=${timestamp}`);
                const songsData = await songsResponse.json();
                setSongs(shuffleArray(songsData));

                const [playlistsRes, albumsRes] = await Promise.all([
                    fetch(`${API_URL}/api/playlists?t=${timestamp}`),
                    fetch(`${API_URL}/api/albums?t=${timestamp}`)
                ]);

                const playlistsData = await playlistsRes.json();
                const albumsData = await albumsRes.json();

                // Normalize albums to look like playlists for the UI
                const normalizedAlbums = albumsData.map(album => ({
                    ...album,
                    name: album.title, // Use title as name
                    isAlbum: true
                }));

                setPlaylists([...playlistsData, ...normalizedAlbums]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <BackgroundWrapper>
            <Navbar />

            <div className="pt-20 px-4 md:px-[25px] h-screen overflow-hidden flex flex-col">
                <div className="w-full flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12 mt-[7px]">

                    {/* Left Panel - Transitions between Playlists, All Songs, and Now Playing */}
                    <div className={`w-full max-w-[435px] ${currentSongId && !showNowPlayingView ? 'h-[510px]' : 'h-[635px]'} transition-all duration-500 ease-in-out backdrop-blur-2xl bg-white/[0.08] border border-white/20 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden`}>

                        {/* Playlists View */}
                        <div className={`absolute inset-0 p-5 overflow-y-auto custom-scrollbar transition-all duration-500 ease-in-out ${isAllSongsView || showNowPlayingView || selectedPlaylist?.name === 'Favorite Songs' ? '-translate-x-full opacity-0 scale-95 pointer-events-none' : 'translate-x-0 opacity-100 scale-100'}`}>
                            <h2 className="text-xl font-bold text-white mb-5 sticky top-0 bg-[#0f0f1a]/50 backdrop-blur-md pt-1 pb-2 z-10">Song playlists</h2>
                            <div className="grid grid-cols-4 gap-x-3 gap-y-5 pb-5">
                                {playlists.filter(playlist => playlist.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                    playlists.filter(playlist => playlist.name.toLowerCase().includes(searchTerm.toLowerCase())).map((playlist) => (
                                        <MovieCard
                                            key={playlist._id}
                                            movieName={playlist.name}
                                            imageUrl={playlist.imageUrl || playlist.coverImg}
                                            isActive={selectedPlaylist && String(selectedPlaylist._id || selectedPlaylist) === String(playlist._id || playlist)}
                                            onClick={() => handlePlaylistClick(playlist)}
                                        />
                                    ))
                                ) : (
                                    <p className="col-span-4 text-white/30 text-center text-sm mt-10">Loading playlists...</p>
                                )}
                            </div>
                        </div>

                        {/* All Songs / Favorites View (Left Panel) */}
                        <div className={`absolute inset-0 p-5 flex flex-col transition-all duration-500 ease-in-out ${isAllSongsView || showNowPlayingView || selectedPlaylist?.name === 'Favorite Songs' ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95 pointer-events-none'}`}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-white">
                                    {selectedPlaylist?.name === 'Favorite Songs' || showNowPlayingView ? 'Favorite Songs' : 'All Songs'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setIsAllSongsView(false);
                                        setShowNowPlayingView(false);
                                        // If we are in favorites view, deselect it to go back to playlists
                                        if (selectedPlaylist?.name === 'Favorite Songs') {
                                            setSelectedPlaylist(null);
                                        }
                                    }}
                                    className="text-[10px] text-white/40 hover:text-white transition-colors bg-white/5 px-2.5 py-1 rounded-full border border-white/10"
                                >
                                    View Playlists
                                </button>
                            </div>

                            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                                {(selectedPlaylist?.name === 'Favorite Songs'
                                    ? favorites.map(id => songs.find(s => String(s._id || s) === String(id))).filter(Boolean)
                                    : songs
                                ).length > 0 ? (
                                    (selectedPlaylist?.name === 'Favorite Songs'
                                        ? favorites.map(id => songs.find(s => String(s._id || s) === String(id))).filter(Boolean)
                                        : songs
                                    ).map((song) => (
                                        <SongItem
                                            key={song._id}
                                            song={song}
                                            songName={song.title}
                                            isActive={String(currentSongId) === String(song._id || song)}
                                            isPlaying={isPlaying && String(currentSongId) === String(song._id || song)}
                                            onClick={() => {
                                                setCurrentSongId(song._id || song);
                                                setIsPlaying(true);
                                                setShowNowPlayingView(true);
                                            }}
                                        />
                                    ))
                                ) : (
                                    <p className="text-white/30 text-center text-sm mt-10">
                                        {selectedPlaylist?.name === 'Favorite Songs' ? 'No favorite songs yet' : 'Loading songs...'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Center - MUSIC Text & Clear Filter */}
                    <div className={`hidden lg:flex flex-col items-center justify-center transition-all duration-500 ${currentSongId ? 'mt-8 lg:mt-[120px]' : 'mt-12 lg:mt-[165px]'} gap-6`}>
                        <h1
                            className="font-bold uppercase tracking-[0.2em] text-6xl md:text-7xl select-none whitespace-nowrap"
                            style={{
                                color: 'rgba(255, 255, 255, 0.15)',
                                WebkitTextStroke: '2px rgba(30, 30, 30, 0.9)',
                                textShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            MUSIC
                        </h1>

                        <button
                            onClick={() => {
                                setIsAllSongsView(true);
                                setSelectedPlaylist(null);
                                setSearchTerm('');
                                setIsAllSongsView(true);
                                setShowNowPlayingView(false);
                            }}
                            className={`px-6 py-2 rounded-full border transition-all duration-300 text-sm font-medium flex items-center gap-2 group ${isAllSongsView && !selectedPlaylist && !searchTerm
                                ? 'bg-white/20 border-white/40 text-white cursor-default'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${isAllSongsView && !selectedPlaylist && !searchTerm ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-white/20'}`}></span>
                            All Songs
                        </button>

                        <button
                            onClick={() => {
                                if (selectedPlaylist?.name === 'Favorite Songs') {
                                    setSelectedPlaylist(null);
                                    setIsAllSongsView(true);
                                } else {
                                    setSelectedPlaylist({
                                        name: 'Favorite Songs',
                                        songs: favorites
                                    });
                                    setIsAllSongsView(false);
                                }
                            }}
                            className={`px-6 py-2 rounded-full border transition-all duration-300 text-sm font-medium flex items-center gap-2 group ${selectedPlaylist?.name === 'Favorite Songs'
                                ? 'bg-red-500/20 border-red-500/40 text-red-500 cursor-default'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${selectedPlaylist?.name === 'Favorite Songs' ? 'fill-current' : 'text-white/20 group-hover:text-red-500'}`} />
                            Favorites
                        </button>
                    </div>

                    {/* Right Panel - Song List & Now Playing */}
                    <div className={`w-full max-w-[435px] ${currentSongId && !showNowPlayingView ? 'h-[510px]' : 'h-[635px]'} transition-all duration-500 ease-in-out backdrop-blur-2xl bg-white/[0.08] border border-white/20 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden mt-[0px]`}>

                        {/* Song List View */}
                        <div className={`absolute inset-0 p-5 flex flex-col transition-all duration-500 ease-in-out ${showNowPlayingView ? 'translate-x-[100%] opacity-0 scale-95 pointer-events-none' : 'translate-x-0 opacity-100 scale-100'}`}>

                            {/* Panel Header */}
                            {/* Panel Header code updated to include Date & Time */}
                            <div className="flex items-center justify-between mb-4 px-1">
                                <div>
                                    <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest">
                                        {selectedPlaylist ? selectedPlaylist.name : 'Song List'}
                                    </h3>
                                    <p className="text-[10px] text-white/40 font-medium mt-0.5 uppercase tracking-wider">
                                        {dateTime.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-lg font-bold text-white/90 tabular-nums leading-none tracking-tight">
                                        {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {selectedPlaylist && (
                                        <span className="text-[10px] text-white/30 font-medium bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                            {filteredSongs.length} tracks
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Center Album Art */}
                            <div className="mb-4 flex justify-center">
                                <div
                                    className="relative w-full max-w-[180px] aspect-square rounded-[24px] bg-cover bg-center backdrop-blur-sm border border-white/15 overflow-hidden shadow-lg transition-all duration-500"
                                    style={{ backgroundImage: currentSong?.coverImg ? `url(${currentSong.coverImg})` : 'none' }}
                                >
                                    {!currentSong?.coverImg && (
                                        <div className="absolute inset-0 flex items-center justify-center p-4">
                                            <p
                                                className="font-bold uppercase tracking-[0.1em] text-center select-none animate-in fade-in duration-1000"
                                                style={{
                                                    color: 'rgba(255, 255, 255, 0.4)',
                                                    fontSize: 'clamp(0.8rem, 4cqw, 1.2rem)',
                                                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                                                    lineHeight: '1.4'
                                                }}
                                            >
                                                "{quotes[quoteIndex]}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Song List */}
                            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                                {filteredSongs.length > 0 ? (
                                    filteredSongs.map((song, index) => (
                                        <SongItem
                                            key={song._id || song}
                                            song={song}
                                            songName={song.title}
                                            isActive={String(currentSongId) === String(song._id || song)}
                                            isPlaying={isPlaying && String(currentSongId) === String(song._id || song)}
                                            onClick={() => {
                                                setCurrentSongId(song._id || song);
                                                setIsPlaying(true);
                                                if (isAllSongsView) setShowNowPlayingView(true);
                                            }}
                                        />
                                    ))
                                ) : (
                                    <p className="text-white/30 text-center text-sm mt-10">
                                        {searchTerm
                                            ? 'No matches found'
                                            : selectedPlaylist?.name === 'Favorite Songs'
                                                ? 'No favorite songs yet'
                                                : songs.length === 0
                                                    ? 'Loading songs...'
                                                    : 'No songs available'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Now Playing View - EXACT PREMIUM DESIGN */}
                        <div className={`absolute inset-0 flex flex-col items-center px-6 py-4 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${showNowPlayingView ? 'translate-x-0 opacity-100 scale-100 z-10' : 'translate-x-[-100%] opacity-0 scale-90 pointer-events-none z-0'}`}>

                            {/* Background Glow Effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[30%] bg-blue-500/10 blur-[100px] pointer-events-none" />

                            {/* Header */}
                            <div className="w-full flex justify-between items-center mb-4 relative z-10 px-2">
                                <button
                                    onClick={() => setShowNowPlayingView(false)}
                                    className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5 text-white" />
                                </button>
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Now Playing</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(currentSong?._id || currentSong);
                                    }}
                                    className={`p-2 rounded-xl transition-all duration-500 ${favorites.some(id => String(id) === String(currentSong?._id || currentSong))
                                        ? 'text-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                                        : 'text-white/20 hover:text-white/60 hover:bg-white/5'
                                        }`}
                                >
                                    <Heart
                                        className={`w-5 h-5 transition-all duration-500 ${favorites.some(id => String(id) === String(currentSong?._id || currentSong)) ? 'fill-current scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : ''}`}
                                    />
                                </button>
                            </div>

                            {/* Album Art Container */}
                            <div className="w-full aspect-square max-w-[190px] rounded-[28px] mb-4 overflow-hidden shadow-2xl bg-white/5 border border-white/10 flex items-center justify-center group relative transition-transform duration-500 hover:scale-[1.02]">
                                {currentSong?.coverImg ? (
                                    <img
                                        src={currentSong.coverImg}
                                        alt={currentSong.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="text-white/10 font-black text-4xl tracking-tighter italic">MUSIC</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>

                            {/* Song Info */}
                            <div className="text-center mb-4 relative z-10 w-full px-4 min-h-[56px] flex flex-col justify-center">
                                <h2 className="text-lg font-bold text-white mb-0.5 tracking-tight drop-shadow-md truncate">
                                    {currentSong?.title || "Unknown Title"}
                                </h2>
                                <p className="text-white/50 text-sm font-medium tracking-wide truncate">
                                    {currentSong?.artist || "Unknown Artist"}
                                </p>
                            </div>

                            {/* Waveform Visualization */}
                            <div className="w-full h-8 flex items-center justify-center gap-[3px] mb-4 px-4">
                                {bars.map((bar, i) => (
                                    <div
                                        key={i}
                                        className="w-[3px] bg-white rounded-full transition-all duration-300"
                                        style={{
                                            height: `${bar.height}%`,
                                            opacity: progress > (i / bars.length) * 100 ? 1 : 0.15,
                                            boxShadow: progress > (i / bars.length) * 100 ? '0 0 10px rgba(255,255,255,0.3)' : 'none'
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Progress Bar Container */}
                            <div className="w-full px-4 mb-4">
                                <div className="flex justify-between text-[9px] font-bold text-white/30 mb-1.5 tracking-widest tabular-nums uppercase">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                                <div className="relative group h-2 flex items-center">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={progress || 0}
                                        onChange={(e) => handleSeek(parseFloat(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                    <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="absolute left-0 top-0 h-full bg-white transition-all duration-100 shadow-[0_0_15_rgba(255,255,255,0.5)]"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    {/* Thumb handle indicator */}
                                    <div
                                        className="absolute h-3.5 w-3.5 bg-white rounded-full border-[2.5px] border-black/20 shadow-xl pointer-events-none z-10 transition-transform group-hover:scale-125"
                                        style={{ left: `calc(${progress}% - 7px)` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Main Controls Overlay */}
                            <div className="w-full flex items-center justify-between px-2 mt-auto pb-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={skipBackward} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all relative group">
                                        <RotateCcw className="w-4 h-4" />
                                        <span className="absolute inset-0 flex items-center justify-center text-[6px] font-black mt-0.5 opacity-60">15</span>
                                    </button>
                                    <button
                                        onClick={() => setIsShuffle(!isShuffle)}
                                        className={`p-2 rounded-full transition-all ${isShuffle ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-white/20 hover:text-white/40'}`}
                                    >
                                        <Shuffle className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button onClick={handlePrevious} className="p-2 text-white/80 hover:text-white transition-all active:scale-90">
                                        <SkipBack className="w-6 h-6 fill-current" strokeWidth={0} />
                                    </button>

                                    <button
                                        onClick={togglePlay}
                                        className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_8px_24px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all text-black"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-5 h-5 fill-current" />
                                        ) : (
                                            <Play className="w-5 h-5 fill-current ml-1" />
                                        )}
                                    </button>

                                    <button onClick={() => handleNext()} className="p-2 text-white/80 hover:text-white transition-all active:scale-90">
                                        <SkipForward className="w-6 h-6 fill-current" strokeWidth={0} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-right">
                                    <button
                                        onClick={() => {
                                            const next = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none';
                                            setRepeatMode(next);
                                        }}
                                        className={`p-2 rounded-full relative transition-all ${repeatMode !== 'none' ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-white/20 hover:text-white/40'}`}
                                    >
                                        <Repeat className="w-4 h-4" />
                                        {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[7px] font-black bg-white text-black w-2.5 h-2.5 rounded-full flex items-center justify-center">1</span>}
                                    </button>
                                    <button onClick={skipForward} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all relative group">
                                        <RotateCcw className="w-4 h-4 scale-x-[-1]" />
                                        <span className="absolute inset-0 flex items-center justify-center text-[6px] font-black mt-0.5 opacity-60">15</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Music Player Controls */}
            <MusicPlayer />
        </BackgroundWrapper>
    );
};

export default MusicLibraryPage;
