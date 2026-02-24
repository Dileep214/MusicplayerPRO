import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';
import { X, Trash2, Upload, Music2, Camera, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

const AlbumEditModal = ({ album, isOpen, onClose, onUpdated }) => {
    const { formatUrl, cleanName } = useMusic();
    // Pre-fill with prop data immediately so modal isn't blank
    const [albumData, setAlbumData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    const coverInputRef = useRef(null);
    const songInputRef = useRef(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // Fetch album with full song list
    const fetchAlbum = useCallback(async () => {
        if (!album?._id) return;
        setLoading(true);
        setFetchError('');
        try {
            const res = await api.get(`/api/albums/${album._id}`);
            setAlbumData(res.data);
        } catch (err) {
            console.error('Error fetching album:', err);
            const errMsg = err.response?.data?.message || err.message || 'Unknown error';
            setFetchError(errMsg);
            // Fall back to prop data so at least cover / basic info shows
            setAlbumData({ ...album, songs: [] });
        } finally {
            setLoading(false);
        }
    }, [album]);

    useEffect(() => {
        if (isOpen && album) {
            // Show prop data immediately
            setAlbumData({ ...album, songs: album.songs || [] });
            fetchAlbum();
        }
        if (!isOpen) {
            setAlbumData(null);
            setFetchError('');
        }
    }, [isOpen, album?._id]);

    if (!isOpen) return null;

    // ── Change Cover Photo ──
    const handleCoverChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('coverImgFile', file);
            const res = await api.patch(`/api/albums/${album._id}/cover`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAlbumData(prev => ({ ...prev, coverImg: res.data.album.coverImg }));
            showToast('✅ Cover photo updated!');
            onUpdated?.();
        } catch (err) {
            alert('Failed to update cover: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    // ── Add Songs ──
    const handleAddSongs = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setSaving(true);
        try {
            const formData = new FormData();
            files.forEach(f => formData.append('songFiles', f));
            const res = await api.patch(`/api/albums/${album._id}/add-songs`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast(`✅ ${res.data.songs.length} song(s) added!`);
            await fetchAlbum(); // Refresh
            onUpdated?.();
        } catch (err) {
            alert('Failed to add songs: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
            e.target.value = '';
        }
    };

    // ── Delete Song from Album ──
    const handleDeleteSong = async (songId, songTitle) => {
        if (!window.confirm(`Remove "${songTitle}" from this album?\nThis will permanently delete the song.`)) return;

        setSaving(true);
        try {
            await api.delete(`/api/albums/${album._id}/songs/${songId}`);
            setAlbumData(prev => ({
                ...prev,
                songs: prev.songs.filter(s => s._id !== songId)
            }));
            showToast('🗑️ Song removed!');
            onUpdated?.();
        } catch (err) {
            alert('Failed to remove song: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

                {/* Toast notification */}
                {toast && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 bg-green-500/90 text-black font-semibold text-sm rounded-full shadow-xl animate-bounce">
                        <CheckCircle2 className="w-4 h-4" />
                        {toast}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-white">Edit Album</h2>
                        <p className="text-white/40 text-sm mt-0.5">{cleanName(album?.title)}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5 text-white/60" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Loading spinner (songs) */}
                    {loading && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10 mb-2">
                            <Loader2 className="w-4 h-4 text-green-400 animate-spin flex-shrink-0" />
                            <span className="text-white/50 text-sm">Loading songs…</span>
                        </div>
                    )}

                    {/* Fetch error banner */}
                    {fetchError && (
                        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-2">
                            <p className="text-yellow-400 text-sm">⚠️ Could not load songs: <span className="text-yellow-300 font-mono">{fetchError}</span></p>
                            <button
                                onClick={fetchAlbum}
                                className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs font-semibold rounded-lg transition-all flex-shrink-0"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {albumData ? (
                        <>
                            {/* ─── Cover Photo ─── */}
                            <div className="flex items-center gap-6 p-5 bg-white/5 rounded-2xl border border-white/10">
                                <div className="relative group flex-shrink-0">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                                        {albumData.coverImg ? (
                                            <img
                                                src={formatUrl(albumData.coverImg)}
                                                alt="cover"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Music2 className="w-8 h-8 text-white/20" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Camera overlay */}
                                    <button
                                        onClick={() => coverInputRef.current?.click()}
                                        disabled={saving}
                                        className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    >
                                        <Camera className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-semibold mb-1">Cover Photo</p>
                                    <p className="text-white/40 text-xs mb-3">Upload a new cover image for this album</p>
                                    <button
                                        onClick={() => coverInputRef.current?.click()}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        Change Cover
                                    </button>
                                    <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                                </div>
                            </div>

                            {/* ─── Add Songs ─── */}
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="text-white font-semibold">Add Songs</p>
                                        <p className="text-white/40 text-xs">Upload audio files to this album (MP3, WAV, etc.)</p>
                                    </div>
                                    <button
                                        onClick={() => songInputRef.current?.click()}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 active:scale-95"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Add Songs
                                    </button>
                                    <input ref={songInputRef} type="file" accept="audio/*" multiple onChange={handleAddSongs} className="hidden" />
                                </div>
                            </div>

                            {/* ─── Songs List ─── */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-white font-semibold">
                                        Songs
                                        <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-xs font-normal">
                                            {albumData.songs?.length || 0}
                                        </span>
                                    </p>
                                </div>

                                {albumData.songs?.length === 0 ? (
                                    <div className="text-center py-10 text-white/30 text-sm">
                                        No songs in this album yet. Add some above!
                                    </div>
                                ) : (
                                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                                        {albumData.songs.map((song, idx) => (
                                            <div
                                                key={song._id}
                                                className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
                                            >
                                                {/* Index */}
                                                <span className="w-5 text-center text-white/30 text-sm flex-shrink-0">
                                                    {idx + 1}
                                                </span>

                                                {/* Cover */}
                                                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                                                    {song.coverImg ? (
                                                        <img src={formatUrl(song.coverImg)} alt="" className="w-full h-full object-cover" loading="lazy" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Music2 className="w-4 h-4 text-white/20" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Title / Artist */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-semibold truncate">{cleanName(song.title)}</p>
                                                    <p className="text-white/40 text-xs truncate">{song.artist}</p>
                                                </div>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => handleDeleteSong(song._id, cleanName(song.title))}
                                                    disabled={saving}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-30"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlbumEditModal;
