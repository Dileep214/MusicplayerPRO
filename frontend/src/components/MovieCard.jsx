import React from 'react';

const MovieCard = ({ movieName, onClick, isActive, imageUrl }) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <div
                onClick={onClick}
                className={`w-20 h-20 rounded-2xl backdrop-blur-sm border transition-all cursor-pointer flex items-center justify-center overflow-hidden ${isActive
                    ? 'bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                    }`}
            >
                {imageUrl ? (
                    <img src={imageUrl} alt={movieName} className="w-full h-full object-cover" />
                ) : (
                    <div className={`w-12 h-12 rounded-xl ${isActive ? 'bg-green-500/20' : 'bg-white/5'}`}></div>
                )}
            </div>

            {/* Movie name below */}
            <p className={`text-xs font-medium text-center transition-colors truncate w-full px-1 ${isActive ? 'text-green-400' : 'text-white'}`}>
                {movieName}
            </p>
        </div>
    );
};

export default MovieCard;
