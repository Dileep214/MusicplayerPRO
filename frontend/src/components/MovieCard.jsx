import React from 'react';

const MovieCard = React.memo(({ movieName, onClick, isActive, imageUrl }) => {
    return (
        <div className="flex flex-col items-center gap-2 group">
            <div
                onClick={onClick}
                className={`group relative w-20 h-20 rounded-2xl backdrop-blur-sm border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer flex items-center justify-center overflow-hidden 
                ${isActive
                        ? 'bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-105'
                        : 'bg-white/10 border-white/10 hover:border-white/40 hover:scale-110 hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)]'
                    }`}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={movieName}
                        loading="lazy"
                        className={`w-full h-full object-cover transition-all duration-700 ease-out ${isActive ? 'brightness-110' : 'brightness-75 group-hover:brightness-105 group-hover:scale-110'}`}
                    />
                ) : (
                    <div className={`w-12 h-12 rounded-xl transition-all duration-500 ease-out ${isActive ? 'bg-green-500/20' : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-110'}`}></div>
                )}

                {/* Hover Overlay with Play Icon placeholder / effect */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out ${isActive ? 'opacity-0' : ''}`}>
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 scale-50 group-hover:scale-100 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[9px] border-l-black border-b-[5px] border-b-transparent ml-1"></div>
                    </div>
                </div>
            </div>

            {/* Movie name below */}
            <p className={`text-[10px] font-bold text-center transition-all duration-500 ease-out truncate w-full px-1 uppercase tracking-tight
                ${isActive ? 'text-green-400 translate-y-0.5' : 'text-white/40 group-hover:text-white group-hover:translate-y-0.5'}`}>
                {movieName}
            </p>
        </div>
    );
});

export default MovieCard;
