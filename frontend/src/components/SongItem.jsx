import React from 'react';
import { Heart } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

const SongItem = ({ song, songName, coverImg, onClick, isActive = false }) => {
    const { favorites, toggleFavorite } = useMusic();
    const isFavorite = favorites.some(id => String(id) === String(song?._id || song));

    return (
        <div
            onClick={onClick}
            className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer border ${isActive
                ? 'bg-blue-600/20 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)] translate-x-1'
                : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                }`}
        >
            {/* Song thumbnail */}
            <div
                className={`w-11 h-11 rounded-xl bg-cover bg-center flex-shrink-0 bg-white/10 transition-transform duration-500 ${isActive ? 'scale-110 rotate-3 border-2 border-blue-400/50' : 'group-hover:scale-105'}`}
                style={{ backgroundImage: coverImg ? `url(${coverImg})` : 'none' }}
            ></div>

            {/* Song details */}
            <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm font-normal truncate">
                    {songName}
                </p>
                {song?.artist && (
                    <p className="text-white/40 text-xs truncate">
                        {song.artist}
                    </p>
                )}
            </div>

            {/* Favorite Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(song?._id || song);
                }}
                className={`p-2 rounded-xl transition-all duration-500 ${isFavorite
                    ? 'text-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                    : 'text-white/20 hover:text-white/60 hover:bg-white/5'
                    }`}
            >
                <Heart
                    className={`w-4 h-4 transition-all duration-500 ${isFavorite ? 'fill-current scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : ''}`}
                />
            </button>
        </div>
    );
};

export default SongItem;
