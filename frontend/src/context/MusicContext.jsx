import React, { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import api from '../api';
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
    const [repeatMode, setRepeatMode] = useState('none');
    const [isAllSongsView, setIsAllSongsView] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showNowPlayingView, setShowNowPlayingView] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
        try {
            const saved = localStorage.getItem('recently_played');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [isBuffering, setIsBuffering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return (saved && saved !== 'undefined') ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [banner, setBanner] = useState(null);

    const updateUser = useCallback((newData) => {
        setUser(prev => {
            const next = { ...prev, ...newData };
            localStorage.setItem('user', JSON.stringify(next));
            return next;
        });
    }, []);

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

    // --- Memoized Values ---

    const currentSong = useMemo(() =>
        songs.find(s => String(s._id || s) === String(currentSongId)) || null,
        [songs, currentSongId]
    );

    const filteredSongs = useMemo(() => {
        let baseSongs = songs;
        if (selectedPlaylist) {
            if (selectedPlaylist.name === 'Favorite Songs') {
                baseSongs = favorites.map(id => songs.find(s => String(s._id || s) === String(id))).filter(Boolean);
            } else {
                baseSongs = (selectedPlaylist.songs || []).map(song => {
                    const sId = typeof song === 'string' ? song : song?._id;
                    return songs.find(s => String(s._id) === String(sId)) || null;
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

    // --- Callbacks & Helpers ---

    const formatUrl = useCallback((url, size = 'thumbnail') => {
        if (!url || typeof url !== 'string') return '';

        let absoluteUrl = url;
        if (!url.startsWith('http')) {
            const cloudName = import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME || 'dzp9rltpr';
            if (url.startsWith('MusicPlayerPRO')) {
                absoluteUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${url}`;
            } else {
                const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
                absoluteUrl = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
            }
        }

        // Apply Cloudinary optimization for images
        if (absoluteUrl.includes('cloudinary.com') && (absoluteUrl.includes('/image/upload/') || absoluteUrl.includes('/video/upload/'))) {
            // Only transform if it's an image or we want to force image-like behavior
            if (!absoluteUrl.includes('/q_auto')) {
                const width = size === 'large' ? '800' : '400';
                // f_auto: best format, q_auto: best quality/size ratio, w_X: specific width
                return absoluteUrl.replace('/upload/', `/upload/q_auto,f_auto,w_${width},c_limit/`);
            }
        }

        return absoluteUrl;
    }, []);

    const cleanName = useCallback((name) => {
        if (!name) return "Unknown";
        let decoded = name;
        try {
            decoded = decodeURIComponent(name);
        } catch (e) { }

        return decoded
            .replace(/primary:/gi, '')
            .replace(/songs\//gi, '')
            .replace(/%20/g, ' ')
            .replace(/%3A/g, ':')
            .replace(/%2F/g, '/')
            .split('/').pop()
            .replace(/\.[^/.]+$/, "")
            .replace(/_/g, ' ')
            .trim();
    }, []);

    const formatTime = useCallback((time) => {
        if (!time || !isFinite(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);

    const handleNext = useCallback((forceNext = true) => {
        if (filteredSongs.length === 0) return;

        // Single song repeat handler
        if (repeatMode === 'one') {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Playback error:", e));
            return;
        }

        let nextIndex;
        const currentIndex = filteredSongs.findIndex(s => String(s._id || s) === String(currentSongId));

        if (isShuffle && filteredSongs.length > 1) {
            // Pick a random song that is NOT the current one
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * filteredSongs.length);
            } while (newIndex === currentIndex);
            nextIndex = newIndex;
        } else {
            nextIndex = currentIndex + 1;
            // Loop back to start instead of stopping
            if (nextIndex >= filteredSongs.length) {
                nextIndex = 0;
            }
        }

        const nextSong = filteredSongs[nextIndex];
        const nextSongId = nextSong?._id || nextSong;

        if (String(nextSongId) === String(currentSongId)) {
            // If it's the same song (e.g. only 1 song in list), restart it
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Playback error:", e));
        } else {
            setCurrentSongId(nextSongId);
        }
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

    const fetchLibraryData = useCallback(async (force = false) => {
        const hasData = songs.length > 0 && playlists.length > 0;
        if (!force && hasData) return;

        setIsLoading(!hasData);
        try {
            const fetchPromises = [
                api.get('/api/songs'),
                api.get('/api/playlists'),
                api.get('/api/albums'),
                api.get('/api/banner')
            ];

            // Only fetch favorites if logged in
            if (localStorage.getItem('accessToken')) {
                fetchPromises.push(api.get('/api/user/favorites'));
            }

            const [songsRes, playlistsRes, albumsRes, bannerRes, favoritesRes] = await Promise.allSettled(fetchPromises);

            const songsData = songsRes.status === 'fulfilled' ? songsRes.value.data : [];
            const playlistsData = playlistsRes.status === 'fulfilled' ? playlistsRes.value.data : [];
            const albumsData = albumsRes.status === 'fulfilled' ? albumsRes.value.data : [];
            const bannerData = bannerRes.status === 'fulfilled' ? bannerRes.value.data : null;
            const favoritesData = (favoritesRes?.status === 'fulfilled' && favoritesRes.value?.data) ? favoritesRes.value.data : [];

            if (bannerData) setBanner(bannerData);

            // Only update if we actually got some data
            if (songsRes.status === 'fulfilled') {
                const processedSongs = force || !hasData ? shuffleArray(songsData) : songsData;
                setSongs(processedSongs);
                localStorage.setItem('cached_songs', JSON.stringify(processedSongs));
            }

            if (playlistsRes.status === 'fulfilled' && albumsRes.status === 'fulfilled') {
                const normalizedAlbums = albumsData.map(album => ({
                    ...album,
                    name: album.title,
                    isAlbum: true
                }));
                const combinedPlaylists = [...playlistsData, ...normalizedAlbums];
                setPlaylists(combinedPlaylists);
                localStorage.setItem('cached_playlists', JSON.stringify(combinedPlaylists));
            }

            if (favoritesRes?.status === 'fulfilled') {
                const favIds = favoritesData.map(f => String(f._id || f));
                setFavorites(favIds);
                localStorage.setItem('cached_favorites', JSON.stringify(favIds));
            }
        } catch (error) {
            console.error('Error fetching library data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [songs.length, playlists.length]);

    const toggleFavorite = useCallback(async (songId) => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            alert('Please log in to use Favorites.');
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
            const response = await api.post(`/api/user/favorites/toggle`, { songId });

            const newFavs = response.data.favorites.map(id => String(id));
            setFavorites(newFavs);
        } catch (err) {
            setFavorites(previousFavorites);
            console.error('Error toggling favorite:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                alert('Session expired. Please login again.');
            }
        }
    }, [favorites]);

    // --- Side Effects ---

    // Initialize from cache if available
    useEffect(() => {
        const cachedSongs = localStorage.getItem('cached_songs');
        const cachedPlaylists = localStorage.getItem('cached_playlists');
        const cachedFavorites = localStorage.getItem('cached_favorites');

        if (cachedSongs) setSongs(JSON.parse(cachedSongs));
        if (cachedPlaylists) setPlaylists(JSON.parse(cachedPlaylists));
        if (cachedFavorites) setFavorites(JSON.parse(cachedFavorites));

        fetchLibraryData();
    }, [fetchLibraryData]);

    // Main Audio Event Listeners
    useEffect(() => {
        const audio = audioRef.current;
        const handleTimeUpdate = () => {
            if (!audio.paused) {
                setCurrentTime(audio.currentTime);
                if (isFinite(audio.duration) && audio.duration > 0) {
                    setProgress((audio.currentTime / audio.duration) * 100);
                }
            }
        };

        const handleProgress = () => {
            // Handle buffering progress if needed
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            if (isFinite(audio.duration) && audio.duration > 0) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };
        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => setIsBuffering(false);
        const handleCanPlay = () => setIsBuffering(false);
        const handleLoadStart = () => setIsBuffering(true);
        const handleError = () => setIsBuffering(false);

        const handleEnded = () => {
            handleNext();
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('durationchange', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('error', handleError);
        audio.addEventListener('progress', handleProgress);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('durationchange', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('progress', handleProgress);
        };
    }, [currentSongId, songs, repeatMode, isShuffle, selectedPlaylist, handleNext]);

    // Media Session & Source Management
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

            // Media Session API for background/OS integration
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: cleanName(currentSong.title),
                    artist: currentSong.artist || 'Unknown Artist',
                    album: currentSong.albumTitle || 'App Record',
                    artwork: [
                        { src: formatUrl(currentSong.coverImg), sizes: '512x512', type: 'image/jpeg' }
                    ]
                });

                navigator.mediaSession.setActionHandler('play', togglePlay);
                navigator.mediaSession.setActionHandler('pause', togglePlay);
                navigator.mediaSession.setActionHandler('previoustrack', handlePrevious);
                navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
                navigator.mediaSession.setActionHandler('seekbackward', skipBackward);
                navigator.mediaSession.setActionHandler('seekforward', skipForward);
            }
        }
    }, [currentSong, isPlaying, formatUrl, cleanName, togglePlay, handleNext, handlePrevious, skipBackward, skipForward]);

    // Volume Management
    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    // Playback State Management
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
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
        } else {
            audioRef.current.pause();
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
        }
    }, [isPlaying]);

    // Track Recently Played
    useEffect(() => {
        if (currentSongId) {
            setRecentlyPlayed(prev => {
                const safeId = String(currentSongId);
                const filtered = prev.filter(id => String(id) !== safeId);
                const updated = [safeId, ...filtered].slice(0, 10); // Keep last 10
                localStorage.setItem('recently_played', JSON.stringify(updated));
                return updated;
            });
        }
    }, [currentSongId]);

    // Proper Cleanup for the Audio Instance
    useEffect(() => {
        const audio = audioRef.current;
        return () => {
            audio.pause();
            audio.src = '';
            audio.load();
        };
    }, []);

    const login = useCallback((userData, tokens = {}) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (tokens.accessToken) localStorage.setItem('accessToken', tokens.accessToken);
        if (tokens.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken);
    }, []);

    const logout = useCallback(() => {
        stopPlayback();
        setUser(null);
        localStorage.clear();
        window.location.href = '/login';
    }, [stopPlayback]);

    const contextValue = useMemo(() => ({
        songs, setSongs,
        playlists, setPlaylists,
        currentSongId, setCurrentSongId,
        currentSong,
        banner, setBanner,
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
        recentlyPlayed,
        favorites, setFavorites,
        toggleFavorite,
        formatUrl,
        cleanName,
        formatTime,
        fetchLibraryData,
        togglePlay, handleNext, handlePrevious, handleSeek, skipForward, skipBackward, stopPlayback,
        user, updateUser, login, logout
    }), [
        songs, playlists, currentSongId, currentSong, banner, isPlaying,
        currentTime, duration, progress, volume, isShuffle,
        repeatMode, isAllSongsView, selectedPlaylist, searchTerm,
        showNowPlayingView, filteredSongs, favorites, toggleFavorite,
        isBuffering, isLoading,
        recentlyPlayed,
        formatUrl, fetchLibraryData, togglePlay, handleNext, handlePrevious, handleSeek,
        skipForward, skipBackward, stopPlayback,
        user, updateUser, login, logout
    ]);


    return (
        <MusicContext.Provider value={contextValue}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => useContext(MusicContext);
