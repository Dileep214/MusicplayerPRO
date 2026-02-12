import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
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

    const audioRef = useRef(new Audio());

    const currentSong = songs.find(s => String(s._id || s) === String(currentSongId)) || null;

    // Filter logic moved here for global access
    const filteredSongs = (() => {
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

        return baseSongs.filter(song => {
            if (!song || typeof song !== 'object') return false;
            const title = String(song.title || '').toLowerCase();
            const artist = String(song.artist || '').toLowerCase();
            const search = String(searchTerm || '').toLowerCase();
            return title.includes(search) || artist.includes(search);
        });
    })();

    useEffect(() => {
        const fetchFavorites = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.id) {
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
        };
        fetchFavorites();
    }, []);

    const toggleFavorite = async (songId) => {
        const user = JSON.parse(localStorage.getItem('user'));

        // Critical Fix: Ensure user HAS an ID. If only name/email exist (from old signup flow), force re-login.
        if (!user || !user.id) {
            alert('Your session is incomplete. Please log in again to use Favorites.');
            localStorage.removeItem('user');
            // Check if we can navigate, otherwise use window location
            window.location.href = '/login';
            return;
        }

        const safeId = String(songId);
        const previousFavorites = [...favorites];

        // Optimistic UI update: Immediate visual feedback
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
                // Sync with server state
                setFavorites(newFavs);
            } else {
                // Revert state on error
                setFavorites(previousFavorites);

                if (response.status === 404) {
                    alert('Session expired. Please login again.');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return;
                }
                const text = await response.text();
                console.error('Toggle favorite failed:', text);
                alert('Could not update favorites. Try logging in again.');
            }
        } catch (err) {
            // Revert state on network error
            setFavorites(previousFavorites);
            console.error('Error toggling favorite:', err);
            alert('Network error. Check your connection.');
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (audio.duration > 0) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => handleNext(repeatMode === 'none' && !isShuffle);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentSongId, songs, repeatMode, isShuffle, selectedPlaylist]);

    const formatUrl = (url) => {
        if (!url) return url;
        if (typeof url !== 'string') return url;
        if (url.startsWith('http')) return url;
        // Fix for Cloudinary paths that might not start with http but aren't local uploads
        if (url.startsWith('MusicPlayerPRO')) return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'dzp9rltpr'}/video/upload/${url}`;

        // Prefix relative paths with API_URL
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    useEffect(() => {
        if (currentSong && currentSong.audioUrl) {
            const absoluteAudioUrl = formatUrl(currentSong.audioUrl);
            if (audioRef.current.src !== absoluteAudioUrl) {
                audioRef.current.src = absoluteAudioUrl;
                audioRef.current.load();
                if (isPlaying) audioRef.current.play().catch(console.error);
            }
        }
    }, [currentSong, isPlaying]);

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play().catch(() => setIsPlaying(false));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const handleNext = (stopAtEnd = false) => {
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
    };

    const handlePrevious = () => {
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
    };

    const handleSeek = (percentage) => {
        if (audioRef.current.duration) {
            const seekTime = (percentage / 100) * audioRef.current.duration;
            audioRef.current.currentTime = seekTime;
        }
    };

    const skipForward = () => {
        audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 15);
    };

    const skipBackward = () => {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
    };

    return (
        <MusicContext.Provider value={{
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
            favorites, setFavorites,
            toggleFavorite,
            formatUrl,
            togglePlay, handleNext, handlePrevious, handleSeek, skipForward, skipBackward
        }}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => useContext(MusicContext);
