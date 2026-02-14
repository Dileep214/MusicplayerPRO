import React from 'react';
import { Play } from 'lucide-react';

const MovieCard = ({ movieName, imageUrl, onClick, isActive = false }) => {
    return (
        <div
            onClick={onClick}
            className={`
                group relative bg-white/5 hover:bg-white/10 rounded-xl p-4
                transition-all duration-300 cursor-pointer
                ${isActive ? 'ring-2 ring-green-500 bg-white/10' : ''}
            `}
        >
            {/* Image Container */}
            <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-white/5">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={movieName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-bold">
                        NO IMAGE
                    </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                    </div>
                </div>
            </div>

            {/* Title */}
            <h3 className="text-white font-semibold text-sm truncate mb-1">
                {movieName}
            </h3>
            <p className="text-white/40 text-xs">
                Playlist
            </p>
        </div>
    );
};

export default MovieCard;
