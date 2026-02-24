import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import MainLayout from '../components/layout/MainLayout';
import MovieCard from '../components/MovieCard';
import SongItem from '../components/SongItem';
import { Heart, Music2, RefreshCw } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

const QUOTES = [
    "Music is the universal language of mankind.",
    "Where words fail, music speaks.",
    "Life is better with music.",
    "Music is the art of thinking with sounds.",
    "Without music, life would be a mistake.",
];

const MusicLibraryPage = () => {
    const {
        songs,
        playlists,
        currentSongId, setCurrentSongId,
        setIsPlaying,
        selectedPlaylist, setSelectedPlaylist,
        searchTerm,
        filteredSongs,
        favorites, toggleFavorite,
        formatUrl,
        cleanName,
        isLoading,
        fetchLibraryData
    } = useMusic();

    const [quoteIndex, setQuoteIndex] = useState(0);
    const [activeView, setActiveView] = useState('playlists'); // 'playlists', 'playlist-detail', 'all-songs', 'favorites'
    const [showLongLoadingMessage, setShowLongLoadingMessage] = useState(false);

    // Long loading message logic
    useEffect(() => {
        let timeout;
        if (isLoading) {
            timeout = setTimeout(() => setShowLongLoadingMessage(true), 4000);
        } else {
            setShowLongLoadingMessage(false);
        }
        return () => clearTimeout(timeout);
    }, [isLoading]);

    // Quote rotation
    useEffect(() => {
        const stored = localStorage.getItem('quoteRotation');
        let initialIndex = 0;
        const now = Date.now();
        const sixHours = 6 * 60 * 60 * 1000;

        if (stored) {
            const { index, timestamp } = JSON.parse(stored);
            if (now - timestamp < sixHours) {
                initialIndex = index;
            } else {
                const elapsedSteps = Math.floor((now - timestamp) / sixHours);
                initialIndex = (index + elapsedSteps) % QUOTES.length;
            }
        } else {
            initialIndex = Math.floor(Math.random() * QUOTES.length);
        }

        setQuoteIndex(initialIndex);
        localStorage.setItem('quoteRotation', JSON.stringify({ index: initialIndex, timestamp: now }));

        const interval = setInterval(() => {
            setQuoteIndex(prev => {
                const next = (prev + 1) % QUOTES.length;
                localStorage.setItem('quoteRotation', JSON.stringify({ index: next, timestamp: Date.now() }));
                return next;
            });
        }, sixHours);

        return () => clearInterval(interval);
    }, []);

    const handlePlaylistClick = useCallback((playlist) => {
        setSelectedPlaylist(playlist);
        setActiveView('playlist-detail');
    }, [setSelectedPlaylist]);

    const handleSongClick = useCallback((song) => {
        setCurrentSongId(song._id || song);
        setIsPlaying(true);
    }, [setCurrentSongId, setIsPlaying]);

    const displayPlaylists = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return playlists.filter(playlist =>
            playlist.name.toLowerCase().includes(search) &&
            playlist.songs && playlist.songs.length > 0
        );
    }, [playlists, searchTerm]);

    const handleRefresh = () => {
        fetchLibraryData(true);
    };

    return (
        <MainLayout>
            <div className="px-4 lg:px-6 py-6 space-y-8">

                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">
                            Your Library
                        </h1>
                        <p className="text-white/50 text-sm">
                            {isLoading ? 'Loading library...' : `${displayPlaylists.length} playlists • ${songs.length} songs`}
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3">
                        <div className="relative group">
                            <button
                                onClick={handleRefresh}
                                className={`w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all ${isLoading ? 'opacity-50' : 'active:scale-95'}`}
                                title="Refresh Library"
                                disabled={isLoading}
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedPlaylist(null);
                                setActiveView('all-songs');
                            }}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${activeView === 'all-songs'
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : 'bg-white/10 text-white hover:bg-white/20'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Music2 className="w-4 h-4" />
                            All Songs
                        </button>
                        <button
                            onClick={() => {
                                setSelectedPlaylist({ name: 'Favorite Songs', songs: favorites });
                                setActiveView('favorites');
                            }}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeView === 'favorites'
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : 'bg-white/10 text-white hover:bg-white/20'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Heart className="w-4 h-4 inline mr-2" />
                            Favorites
                        </button>
                    </div>
                </div>

                {isLoading && showLongLoadingMessage && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center animate-pulse">
                        <p className="text-green-400 text-sm font-medium">
                            Synthesizing your experience... Waking up the server for premium performance.
                        </p>
                    </div>
                )}

                {/* Playlists Grid */}
                {activeView === 'playlists' && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Playlists & Albums</h2>
                        {isLoading && playlists.length === 0 ? (
                            <LoadingSkeleton type="playlist" count={12} />
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {displayPlaylists.length > 0 ? (
                                    displayPlaylists.map((playlist) => (
                                        <MovieCard
                                            key={playlist._id}
                                            movieName={cleanName(playlist.name)}
                                            imageUrl={formatUrl(playlist.imageUrl || playlist.coverImg)}
                                            isActive={selectedPlaylist && String(selectedPlaylist._id) === String(playlist._id)}
                                            type={playlist.isAlbum ? 'Album' : 'Playlist'}
                                            onClick={() => handlePlaylistClick(playlist)}
                                        />
                                    ))
                                ) : !isLoading && (
                                    <p className="col-span-full text-white/30 text-center py-12">
                                        {searchTerm ? 'No matching playlists found' : 'No playlists available'}
                                    </p>
                                )}
                                {isLoading && playlists.length > 0 && (
                                    <div className="col-span-full flex justify-center py-4">
                                        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Playlist Detail / All Songs / Favorites */}
                {(activeView === 'playlist-detail' || activeView === 'all-songs' || activeView === 'favorites') && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <button
                                    onClick={() => {
                                        setSelectedPlaylist(null);
                                        setActiveView('playlists');
                                    }}
                                    className="inline-flex items-center gap-4 px-4 py-3 mb-3 rounded-xl bg-white/10 text-white text-sm font-semibold shadow-lg hover:bg-white/15 transition-all duration-200 active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Library
                                </button>
                                <h2 className="text-3xl font-black text-white">
                                    {activeView === 'favorites' ? 'Favorite Songs' :
                                        activeView === 'all-songs' ? 'All Songs' :
                                            cleanName(selectedPlaylist?.name)}
                                </h2>
                                <p className="text-white/50 text-sm mt-1">
                                    {isLoading ? 'Counting...' : `${filteredSongs.length} tracks`}
                                </p>
                            </div>
                        </div>

                        {/* Songs List */}
                        <div className="space-y-2">
                            {isLoading && filteredSongs.length === 0 ? (
                                <LoadingSkeleton type="song" count={10} />
                            ) : filteredSongs.length > 0 ? (
                                filteredSongs.map((song) => (
                                    <SongItem
                                        key={song._id || song}
                                        song={song}
                                        imageUrl={song.coverImg ? formatUrl(song.coverImg) : null}
                                        isActive={String(currentSongId) === String(song._id || song)}
                                        isFavorite={favorites.some(id => String(id) === String(song._id || song))}
                                        onToggleFavorite={toggleFavorite}
                                        onClick={handleSongClick}
                                    />
                                ))
                            ) : !isLoading && (
                                <div className="text-center py-20">
                                    <p className="text-white/30 text-lg mb-2">
                                        {activeView === 'favorites' ? 'No favorite songs yet' : 'No songs found'}
                                    </p>
                                    <p className="text-white/20 text-sm italic">
                                        "{QUOTES[quoteIndex]}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </MainLayout>
    );
};

export default MusicLibraryPage;
