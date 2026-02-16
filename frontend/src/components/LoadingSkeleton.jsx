import React from 'react';

export const PlaylistSkeleton = () => (
    <div className="bg-white/5 rounded-xl p-4 space-y-4 animate-pulse">
        <div className="relative aspect-square rounded-lg bg-white/10" />
        <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
    </div>
);

export const SongSkeleton = () => (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg animate-pulse">
        <div className="w-12 h-12 rounded-md bg-white/10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded w-1/3" />
            <div className="h-3 bg-white/10 rounded w-1/4" />
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10" />
    </div>
);

const LoadingSkeleton = ({ type = 'playlist', count = 6 }) => {
    return (
        <div className={type === 'playlist'
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            : "space-y-2"
        }>
            {[...Array(count)].map((_, i) => (
                type === 'playlist' ? <PlaylistSkeleton key={i} /> : <SongSkeleton key={i} />
            ))}
        </div>
    );
};

export default LoadingSkeleton;
