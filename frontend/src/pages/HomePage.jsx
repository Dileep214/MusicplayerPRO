import React, { useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Link, useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Music2, Heart, Disc3 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

/* ── tiny helpers ── */
const SectionHeader = ({ title, to }) => (
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black text-white">{title}</h2>
        {to && (
            <Link to={to} className="flex items-center gap-1 text-sm text-white/50 hover:text-green-400 transition-colors font-semibold">
                See all <ChevronRight className="w-4 h-4" />
            </Link>
        )}
    </div>
);

const AlbumCard = ({ name, coverUrl, type, onClick }) => (
    <button
        onClick={onClick}
        className="group flex flex-col gap-3 text-left focus:outline-none"
    >
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white/5 shadow-xl">
            {coverUrl ? (
                <img src={coverUrl} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500/20 to-purple-600/20">
                    <Disc3 className="w-12 h-12 text-white/20" />
                </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-2xl shadow-green-500/50 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                </div>
            </div>
            {/* Badge */}
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold bg-black/60 backdrop-blur-sm text-white/70">
                {type}
            </span>
        </div>
        <p className="text-white font-semibold text-sm truncate">{name}</p>
    </button>
);

const SongRow = ({ index, song, isActive, isFavorite, onPlay, onFavorite, formatUrl, cleanName }) => (
    <div
        onClick={() => onPlay(song)}
        className={`group flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
            ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
    >
        {/* Index / play indicator */}
        <div className="w-6 text-center flex-shrink-0">
            {isActive ? (
                <span className="flex items-end justify-center gap-px h-4">
                    {[1, 2, 3].map(i => (
                        <span key={i} className={`w-1 bg-green-400 rounded-full animate-bounce`} style={{ height: `${[60, 100, 75][i - 1]}%`, animationDelay: `${i * 0.15}s` }} />
                    ))}
                </span>
            ) : (
                <span className="text-white/40 text-sm font-semibold group-hover:hidden">{String(index + 1).padStart(2, '0')}</span>
            )}
            {!isActive && (
                <Play className="w-4 h-4 text-green-400 hidden group-hover:block ml-auto mr-auto" />
            )}
        </div>

        {/* Cover */}
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
            {song.coverImg && formatUrl(song.coverImg) ? (
                <img src={formatUrl(song.coverImg)} alt={song.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-4 h-4 text-white/20" />
                </div>
            )}
        </div>

        {/* Title & Artist */}
        <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${isActive ? 'text-green-400' : 'text-white'}`}>
                {cleanName(song.title)}
            </p>
            <p className="text-xs text-white/40 truncate">{song.artist || 'Unknown Artist'}</p>
        </div>

        {/* Favorite */}
        <button
            onClick={e => { e.stopPropagation(); onFavorite(song._id); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/10"
        >
            <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white/40'}`} />
        </button>
    </div>
);

/* ── Main Component ── */
const HomePage = () => {
    const {
        user, songs, playlists,
        currentSongId, setCurrentSongId, setIsPlaying,
        favorites, toggleFavorite, banner,
        formatUrl, cleanName, setSelectedPlaylist, setSearchTerm, setIsAllSongsView
    } = useMusic();

    const navigate = useNavigate();
    const userName = user?.name?.split(' ')[0] || 'Music Lover';

    /* pick 6 featured playlists/albums */
    const featuredPlaylists = useMemo(() =>
        playlists.filter(p => p.songs?.length > 0).slice(0, 6),
        [playlists]
    );

    /* pick top 7 songs */
    const popularSongs = useMemo(() => songs.slice(0, 7), [songs]);

    /* the hero song / featured album */
    const heroPlaylist = featuredPlaylists[0] || null;

    const handlePlaySong = (song) => {
        setSelectedPlaylist(null);
        setSearchTerm('');
        setCurrentSongId(song._id || song);
        setIsPlaying(true);
    };

    const handlePlaylistClick = (playlist) => {
        setSelectedPlaylist(playlist);
        setSearchTerm('');
        navigate('/library');
    };

    const greetingTime = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <MainLayout>
            <div className="px-4 lg:px-6 py-6 space-y-10 max-w-7xl mx-auto">

                {/* ─── HERO ─── */}
                <div className="relative rounded-3xl overflow-hidden min-h-[300px] flex items-end">
                    {/* Background image */}
                    {(banner?.imageUrl || heroPlaylist) && (
                        <img
                            src={formatUrl(banner?.imageUrl || heroPlaylist?.imageUrl || heroPlaylist?.coverImg, 'large')}
                            alt={banner?.title || heroPlaylist?.name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )}
                    {/* gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 p-8 md:p-12 max-w-lg">
                        <p className="text-green-400 font-semibold text-sm uppercase tracking-widest mb-2">
                            {greetingTime()}, {userName} 👋
                        </p>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                            {banner?.title || (heroPlaylist ? cleanName(heroPlaylist.name) : 'Your Music')}
                        </h1>
                        <p className="text-white/60 text-sm mb-6 leading-relaxed">
                            {banner?.subtitle || (heroPlaylist
                                ? `${heroPlaylist.songs?.length || 0} tracks ready to play`
                                : 'Discover and enjoy your personal music collection.')}
                        </p>
                        <div className="flex gap-3 flex-wrap">
                            <Link
                                to={banner?.buttonLink || "/library"}
                                onClick={() => !banner?.buttonLink && heroPlaylist && handlePlaylistClick(heroPlaylist)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-all shadow-xl shadow-green-500/30 hover:scale-105 active:scale-95"
                            >
                                <Play className="w-4 h-4 fill-black" />
                                {banner?.buttonText || 'Play Now'}
                            </Link>
                            {!banner && (
                                <Link
                                    to="/library"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full border border-white/20 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
                                >
                                    Browse Library
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── POPULAR ALBUMS / PLAYLISTS ─── */}
                {featuredPlaylists.length > 0 && (
                    <section>
                        <SectionHeader title="Popular Albums & Playlists" to="/library" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {featuredPlaylists.map(pl => (
                                <AlbumCard
                                    key={pl._id}
                                    name={cleanName(pl.name)}
                                    coverUrl={formatUrl(pl.imageUrl || pl.coverImg)}
                                    type={pl.isAlbum ? 'Album' : 'Playlist'}
                                    onClick={() => handlePlaylistClick(pl)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* ─── POPULAR SONGS ─── */}
                {popularSongs.length > 0 && (
                    <section>
                        <SectionHeader title="Popular Tracks" to="/library" />
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                            {popularSongs.map((song, i) => (
                                <SongRow
                                    key={song._id || i}
                                    index={i}
                                    song={song}
                                    isActive={String(currentSongId) === String(song._id)}
                                    isFavorite={favorites.some(id => String(id) === String(song._id))}
                                    onPlay={handlePlaySong}
                                    onFavorite={toggleFavorite}
                                    formatUrl={formatUrl}
                                    cleanName={cleanName}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* ─── EMPTY STATE ─── */}
                {songs.length === 0 && playlists.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center">
                            <Music2 className="w-10 h-10 text-white/20" />
                        </div>
                        <p className="text-white/40 text-lg font-semibold">Your library is loading…</p>
                        <p className="text-white/20 text-sm">The server might be waking up, please wait a moment.</p>
                    </div>
                )}

            </div>
        </MainLayout>
    );
};

export default HomePage;
