import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import MainLayout from '../components/layout/MainLayout';
import MovieCard from '../components/MovieCard';
import SongItem from '../components/SongItem';
import API_URL from '../config';
import { Heart, Music2 } from 'lucide-react';

const QUOTES = [
    "Music is the universal language of mankind.",
    "Where words fail, music speaks.",
    "Life is better with music.",
    "Music is the art of thinking with sounds.",
    "Without music, life would be a mistake.",
];

const shuffleArray = (array) => {
    if (!Array.isArray(array)) return [];
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const MusicLibraryPage = () => {
    const {
        songs, setSongs,
        playlists, setPlaylists,
        currentSongId, setCurrentSongId,
        currentSong,
        setIsPlaying,
        selectedPlaylist, setSelectedPlaylist,
        searchTerm,
        filteredSongs,
        favorites, toggleFavorite,
        formatUrl
    } = useMusic();

    const [quoteIndex, setQuoteIndex] = useState(0);
    const [activeView, setActiveView] = useState('playlists'); // 'playlists', 'playlist-detail', 'all-songs', 'favorites'

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            if (songs.length > 0 && playlists.length > 0) return;

            try {
                const songsResponse = await fetch(`${API_URL}/api/songs`);
                const songsData = await songsResponse.json();
                setSongs(shuffleArray(songsData));

                const [playlistsRes, albumsRes] = await Promise.all([
                    fetch(`${API_URL}/api/playlists`),
                    fetch(`${API_URL}/api/albums`)
                ]);

                const playlistsData = await playlistsRes.json();
                const albumsData = await albumsRes.json();

                const normalizedAlbums = albumsData.map(album => ({
                    ...album,
                    name: album.title,
                    isAlbum: true
                }));

                setPlaylists([...playlistsData, ...normalizedAlbums]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [songs.length, playlists.length, setSongs, setPlaylists]);

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
                            {displayPlaylists.length} playlists • {songs.length} songs
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setSelectedPlaylist(null);
                                setActiveView('all-songs');
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeView === 'all-songs'
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            <Music2 className="w-4 h-4 inline mr-2" />
                            All Songs
                        </button>
                        <button
                            onClick={() => {
                                setSelectedPlaylist({ name: 'Favorite Songs', songs: favorites });
                                setActiveView('favorites');
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeView === 'favorites'
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            <Heart className="w-4 h-4 inline mr-2" />
                            Favorites
                        </button>
                    </div>
                </div>

                {/* Playlists Grid */}
                {activeView === 'playlists' && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Playlists & Albums</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {displayPlaylists.length > 0 ? (
                                displayPlaylists.map((playlist) => (
                                    <MovieCard
                                        key={playlist._id}
                                        movieName={playlist.name}
                                        imageUrl={formatUrl(playlist.imageUrl || playlist.coverImg)}
                                        isActive={selectedPlaylist && String(selectedPlaylist._id) === String(playlist._id)}
                                        onClick={() => handlePlaylistClick(playlist)}
                                    />
                                ))
                            ) : (
                                <p className="col-span-full text-white/30 text-center py-12">
                                    {searchTerm ? 'No matching playlists found' : 'No playlists available'}
                                </p>
                            )}
                        </div>
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
                                    className="text-white/60 hover:text-white text-sm mb-2 transition-colors"
                                >
                                    ← Back to Library
                                </button>
                                <h2 className="text-3xl font-black text-white">
                                    {activeView === 'favorites' ? 'Favorite Songs' :
                                        activeView === 'all-songs' ? 'All Songs' :
                                            selectedPlaylist?.name}
                                </h2>
                                <p className="text-white/50 text-sm mt-1">
                                    {filteredSongs.length} tracks
                                </p>
                            </div>
                        </div>

                        {/* Songs List */}
                        <div className="space-y-2">
                            {filteredSongs.length > 0 ? (
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
                            ) : (
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
