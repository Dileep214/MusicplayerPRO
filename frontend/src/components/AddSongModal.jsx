import React, { useState } from 'react';
import { X, Upload, Music, Mic, Clock, Disc } from 'lucide-react';
import axios from 'axios';
import API_URL from '../api/config';

const AddSongModal = ({ isOpen, onClose, onSongAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        album: '',
        duration: '',
        category: 'General'
    });
    const [audioFile, setAudioFile] = useState(null);
    const [coverImgFile, setCoverImgFile] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.name === 'audioFile') {
            setAudioFile(e.target.files[0]);
        } else if (e.target.name === 'coverImgFile') {
            setCoverImgFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('artist', formData.artist);
        data.append('album', formData.album);
        data.append('duration', formData.duration);
        data.append('category', formData.category);
        if (audioFile) data.append('audioFile', audioFile);
        if (coverImgFile) data.append('coverImgFile', coverImgFile);

        try {
            const response = await axios.post(`${API_URL}/api/songs`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onSongAdded(response.data);
            onClose();
            // Reset
            setFormData({
                title: '',
                artist: '',
                album: '',
                duration: '',
                category: 'General'
            });
            setAudioFile(null);
            setCoverImgFile(null);
        } catch (error) {
            console.error('Error adding song:', error);
            alert('Failed to add song. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e2e] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Music className="w-5 h-5 text-green-400" />
                        Add New Song
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Music className="w-4 h-4" /> Title
                            </label>
                            <input
                                required
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Song title"
                                className="w-full bg-[#2a2a3c] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Mic className="w-4 h-4" /> Artist
                            </label>
                            <input
                                required
                                type="text"
                                name="artist"
                                value={formData.artist}
                                onChange={handleChange}
                                placeholder="Artist name"
                                className="w-full bg-[#2a2a3c] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Disc className="w-4 h-4" /> Album (Optional)
                            </label>
                            <input
                                type="text"
                                name="album"
                                value={formData.album}
                                onChange={handleChange}
                                placeholder="Album name"
                                className="w-full bg-[#2a2a3c] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Duration
                            </label>
                            <input
                                required
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder="e.g. 3:45"
                                className="w-full bg-[#2a2a3c] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Audio File (.mp3)
                        </label>
                        <div className="relative group">
                            <input
                                required
                                type="file"
                                name="audioFile"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="audio-upload"
                            />
                            <label
                                htmlFor="audio-upload"
                                className="w-full flex items-center gap-3 bg-[#2a2a3c] border-2 border-dashed border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-pointer hover:border-green-500/50 hover:bg-green-500/5 transition-all"
                            >
                                <Music className="w-5 h-5" />
                                <span className="truncate">{audioFile ? audioFile.name : 'Choose audio file...'}</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Disc className="w-4 h-4" /> Cover Artwork
                        </label>
                        <div className="relative group">
                            <input
                                type="file"
                                name="coverImgFile"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="w-full flex items-center gap-3 bg-[#2a2a3c] border-2 border-dashed border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                            >
                                <Upload className="w-5 h-5" />
                                <span className="truncate">{coverImgFile ? coverImgFile.name : 'Choose cover image...'}</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 ${loading ? 'bg-green-600/50' : 'bg-green-500 hover:bg-green-600'} text-[#0f0f1a] font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/20`}
                        >
                            {loading ? 'Uploading...' : 'Add Song'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSongModal;
