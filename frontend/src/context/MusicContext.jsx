import React, { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import API_URL from '../config';

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [currentSongId, setCurrentSongId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'all', 'one'
    const [isAllSongsView, setIsAllSongsView] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showNowPlayingView, setShowNowPlayingView] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const audioRef = useRef(new Audio());

    const shuffleArray = (array) => {
        if (!Array.isArray(array)) return [];
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Global fetch for library data
    const fetchLibraryData = useCallback(async (force = false) => {
        if (!force && songs.length > 0 && playlists.length > 0) return;

        setIsLoading(true);
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
            console.error('Error fetching library data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [songs.length, playlists.length]);

    useEffect(() => {
        fetchLibraryData();
    }, []);

    const currentSong = useMemo(() =>
        songs.find(s => String(s._id || s) === String(currentSongId)) || null,
        [songs, currentSongId]
    );

    // Optimized Filter logic with useMemo
    const filteredSongs = useMemo(() => {
        let baseSongs = songs;
        if (selectedPlaylist) {
            if (selectedPlaylist.name === 'Favorite Songs') {
                baseSongs = favorites.map(id => songs.find(s => String(s._id || s) === String(id))).filter(Boolean);
            } else {
                baseSongs = (selectedPlaylist.songs || []).map(song => {
                    if (typeof song === 'string' || song instanceof String) {
                        return songs.find(s => String(s._id) === String(song)) || null;
                    }
                    return song;
                }).filter(Boolean);
            }
        }

        const search = String(searchTerm || '').toLowerCase();
        if (!search) return baseSongs;

        return baseSongs.filter(song => {
            if (!song || typeof song !== 'object') return false;
            const title = String(song.title || '').toLowerCase();
            const artist = String(song.artist || '').toLowerCase();
            return title.includes(search) || artist.includes(search);
        });
    }, [songs, selectedPlaylist, favorites, searchTerm]);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const userString = localStorage.getItem('user');
                if (!userString || userString === 'undefined') return;
                const user = JSON.parse(userString);
                if (user && (user.id || user._id)) {
                    try {
                        const response = await fetch(`${API_URL}/api/user/favorites/${user.id}`);
                        if (response.ok) {
                            const data = await response.json();
                            setFavorites(data.map(f => String(f._id || f)));
                        }
                    } catch (err) {
                        console.error('Error fetching favorites:', err);
                    }
                }
            } catch (e) {
                console.error('Failed to parse user for favorites:', e);
            }
        };
        fetchFavorites();
    }, []);

    const toggleFavorite = useCallback(async (songId) => {
        let user = null;
        try {
            const userString = localStorage.getItem('user');
            if (userString && userString !== 'undefined') {
                user = JSON.parse(userString);
            }
        } catch (e) {
            console.error('Failed to parse user session:', e);
        }

        if (!user || !user.id) {
            alert('Your session is incomplete. Please log in again to use Favorites.');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
        }

        const safeId = String(songId);
        const previousFavorites = [...favorites];

        setFavorites(prev => {
            if (prev.includes(safeId)) {
                return prev.filter(id => id !== safeId);
            } else {
                return [...prev, safeId];
            }
        });

        try {
            const response = await fetch(`${API_URL}/api/user/favorites/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, songId })
            });

            if (response.ok) {
                const data = await response.json();
                const newFavs = data.favorites.map(id => String(id));
                setFavorites(newFavs);
            } else {
                setFavorites(previousFavorites);
                if (response.status === 404) {
                    alert('Session expired. Please login again.');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }
        } catch (err) {
            setFavorites(previousFavorites);
            console.error('Error toggling favorite:', err);
        }
    }, [favorites]);

    useEffect(() => {
        const audio = audioRef.current;
        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (audio.duration > 0) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => setIsBuffering(false);
        const handleCanPlay = () => setIsBuffering(false);
        const handleLoadStart = () => setIsBuffering(true);
        const handleError = () => setIsBuffering(false);

        const handleEnded = () => {
            handleNext(repeatMode === 'none' && !isShuffle);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('error', handleError);
        };
    }, [currentSongId, songs, repeatMode, isShuffle, selectedPlaylist]);

    const formatUrl = useCallback((url) => {
        if (!url || typeof url !== 'string') return '';
        if (url.startsWith('http')) return url;

        const cloudName = import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME || 'dzp9rltpr';
        if (url.startsWith('MusicPlayerPRO')) return `https://res.cloudinary.com/${cloudName}/video/upload/${url}`;

        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }, []);

    useEffect(() => {
        if (currentSong && currentSong.audioUrl) {
            const absoluteAudioUrl = formatUrl(currentSong.audioUrl);
            if (audioRef.current.src !== absoluteAudioUrl) {
                audioRef.current.src = absoluteAudioUrl;
                audioRef.current.load();
                if (isPlaying) {
                    const playPromise = audioRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            if (error.name !== 'AbortError') console.error('Playback error:', error);
                        });
                    }
                }
            }
        }
    }, [currentSong, isPlaying, formatUrl]);

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        if (isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    if (error.name !== 'AbortError') {
                        console.error('Playback error:', error);
                        setIsPlaying(false);
                    }
                });
            }
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);

    const handleNext = useCallback((stopAtEnd = false) => {
        if (filteredSongs.length === 0) return;
        if (repeatMode === 'one') {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            return;
        }

        let nextIndex;
        const currentIndex = filteredSongs.findIndex(s => String(s._id || s) === String(currentSongId));

        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * filteredSongs.length);
        } else {
            nextIndex = currentIndex + 1;
            if (nextIndex >= filteredSongs.length) {
                if (stopAtEnd) return;
                nextIndex = 0;
            }
        }
        setCurrentSongId(filteredSongs[nextIndex]?._id || filteredSongs[nextIndex]);
        setIsPlaying(true);
    }, [filteredSongs, isShuffle, repeatMode, currentSongId]);

    const handlePrevious = useCallback(() => {
        if (filteredSongs.length === 0) return;
        let prevIndex;
        const currentIndex = filteredSongs.findIndex(s => String(s._id || s) === String(currentSongId));

        if (isShuffle) {
            prevIndex = Math.floor(Math.random() * filteredSongs.length);
        } else {
            prevIndex = currentIndex - 1;
            if (prevIndex < 0) prevIndex = filteredSongs.length - 1;
        }
        setCurrentSongId(filteredSongs[prevIndex]?._id || filteredSongs[prevIndex]);
        setIsPlaying(true);
    }, [filteredSongs, isShuffle, currentSongId]);

    const handleSeek = useCallback((percentage) => {
        if (audioRef.current.duration) {
            const seekTime = (percentage / 100) * audioRef.current.duration;
            audioRef.current.currentTime = seekTime;
        }
    }, []);

    const skipForward = useCallback(() => {
        audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 15);
    }, []);

    const skipBackward = useCallback(() => {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
    }, []);

    const stopPlayback = useCallback(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        setIsPlaying(false);
        setCurrentSongId(null);
        setCurrentTime(0);
        setDuration(0);
        setProgress(0);
    }, []);

    const contextValue = useMemo(() => ({
        songs, setSongs,
        playlists, setPlaylists,
        currentSongId, setCurrentSongId,
        currentSong,
        isPlaying, setIsPlaying,
        currentTime, duration, progress,
        volume, setVolume,
        isShuffle, setIsShuffle,
        repeatMode, setRepeatMode,
        isAllSongsView, setIsAllSongsView,
        selectedPlaylist, setSelectedPlaylist,
        searchTerm, setSearchTerm,
        showNowPlayingView, setShowNowPlayingView,
        filteredSongs,
        isBuffering,
        isLoading,
        favorites, setFavorites,
        toggleFavorite,
        formatUrl,
        fetchLibraryData,
        togglePlay, handleNext, handlePrevious, handleSeek, skipForward, skipBackward, stopPlayback
    }), [
        songs, playlists, currentSongId, currentSong, isPlaying,
        currentTime, duration, progress, volume, isShuffle,
        repeatMode, isAllSongsView, selectedPlaylist, searchTerm,
        showNowPlayingView, filteredSongs, favorites, toggleFavorite,
        isBuffering, isLoading,
        formatUrl, fetchLibraryData, togglePlay, handleNext, handlePrevious, handleSeek,
        skipForward, skipBackward, stopPlayback
    ]);

    return (
        <MusicContext.Provider value={contextValue}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => useContext(MusicContext);
