import React, { useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

const SongItem = React.memo(({
    song,
    isActive = false,
    onClick,
    isFavorite = false,
    onToggleFavorite,
    imageUrl
}) => {
    const { cleanName } = useMusic();

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
            className={`
                group flex items-center gap-3 px-4 py-2 rounded-lg
                transition-all duration-200 cursor-pointer
                ${isActive
                    ? 'bg-white/10'
                    : 'hover:bg-white/5'
                }
            `}
        >
            {/* Song thumbnail */}
            <div className="w-12 h-12 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={cleanName(song?.title)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] font-bold">
                        MUSIC
                    </div>
                )}
            </div>

            {/* Song details */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate transition-colors ${isActive ? 'text-green-400' : 'text-white'
                    }`}>
                    {cleanName(song?.title)}
                </p>
                {song?.artist && (
                    <p className="text-xs text-white/40 truncate">
                        {song.artist}
                    </p>
                )}
            </div>

            {/* Favorite Button */}
            <button
                onClick={handleHeartClick}
                className={`
                    p-2 rounded-full transition-all duration-200
                    ${isFavorite
                        ? 'text-red-500 hover:text-red-400'
                        : 'text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100'
                    }
                `}
            >
                <Heart
                    className={`w-4 h-4 transition-all ${isFavorite ? 'fill-current' : ''
                        }`}
                />
            </button>
        </div>
    );
});

export default SongItem;
