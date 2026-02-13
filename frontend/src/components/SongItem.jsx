import React, { useCallback } from 'react';
import { Heart } from 'lucide-react';

const SongItem = React.memo(({
    song,
    isActive = false,
    onClick,
    isFavorite = false,
    onToggleFavorite,
    imageUrl
}) => {
    const handleMainClick = useCallback(() => {
        onClick(song);
    }, [onClick, song]);

    const handleHeartClick = useCallback((e) => {
        e.stopPropagation();
        onToggleFavorite(song?._id || song);
    }, [onToggleFavorite, song]);

    return (
        <div
            onClick={handleMainClick}
            className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer border ${isActive
                ? 'bg-white/10 border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)] translate-x-1'
                : 'bg-transparent border-transparent hover:bg-white/5 hover:translate-x-1'
                }`}
        >
            {/* Song thumbnail */}
            <div
                className={`w-11 h-11 rounded-xl bg-cover bg-center flex-shrink-0 bg-white/10 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isActive ? 'scale-110 shadow-lg border border-white/20' : 'group-hover:scale-105 group-hover:shadow-md'}`}
                style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }}
            ></div>

            {/* Song details */}
            <div className="flex-1 min-w-0 transition-all duration-500">
                <p className={`text-sm font-semibold truncate transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                    {song?.title}
                </p>
                {song?.artist && (
                    <p className={`text-xs truncate transition-colors duration-500 ${isActive ? 'text-white/40' : 'text-white/20 group-hover:text-white/40'}`}>
                        {song.artist}
                    </p>
                )}
            </div>

            {/* Favorite Button */}
            <button
                onClick={handleHeartClick}
                className={`p-2 rounded-xl transition-all duration-500 ease-out ${isFavorite
                    ? 'text-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                    : 'text-white/10 hover:text-white/60 hover:bg-white/10 opacity-0 group-hover:opacity-100'
                    }`}
            >
                <Heart
                    className={`w-4 h-4 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isFavorite ? 'fill-current scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'scale-90 group-hover:scale-100'}`}
                />
            </button>
        </div>
    );
});

export default SongItem;
