import React, { useState } from 'react';
import { X, Upload, Disc, User, Calendar, Music } from 'lucide-react';
import axios from 'axios';
import API_URL from '../config';

const AddAlbumModal = ({ isOpen, onClose, onAlbumAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        releaseDate: ''
    });
    const [coverImgFile, setCoverImgFile] = useState(null);
    const [songFiles, setSongFiles] = useState([]);

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.name === 'coverImgFile') {
            setCoverImgFile(e.target.files[0]);
        } else if (e.target.name === 'songFiles') {
            const files = Array.from(e.target.files);
            setSongFiles(files);

            // If capturing folder name
            if (files.length > 0 && files[0].webkitRelativePath) {
                const folderName = files[0].webkitRelativePath.split('/')[0];
                if (folderName && !formData.title) {
                    setFormData(prev => ({ ...prev, title: folderName }));
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (songFiles.length === 0) {
            alert('Please select some songs to add to the album.');
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('artist', formData.artist);
        data.append('releaseDate', formData.releaseDate);
        if (coverImgFile) data.append('coverImgFile', coverImgFile);

        // Append only audio files
        const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
        let addedSongs = 0;
        songFiles.forEach(file => {
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            if (audioExtensions.includes(ext)) {
                data.append('songFiles', file);
                addedSongs++;
            }
        });

        if (addedSongs === 0) {
            alert('No valid audio files found in the selection.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/albums`, data, {
                // Remove manual Content-Type header, axios handles it better with FormData
                timeout: 300000 // 5 minutes timeout for large uploads
            });
            onAlbumAdded(response.data);
            onClose();
            setFormData({
                title: '',
                artist: '',
                releaseDate: ''
            });
            setCoverImgFile(null);
            setSongFiles([]);
            alert('Album uploaded successfully!');
        } catch (error) {
            console.error('Error adding album:', error);
            const message = error.response?.data?.message || 'Failed to add album';
            const details = error.response?.data?.error || '';
            const status = error.response?.status || 'Unknown status';
            alert(`Error ${status}: ${message}\n${details}\n\nHint: If it's a timeout, try uploading fewer songs at once.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1e1e2e] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Disc className="w-5 h-5 text-purple-400" />
                        Add New Album
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Select Album Folder / Songs
                        </label>
                        <div className="relative group">
                            <input
                                type="file"
                                name="songFiles"
                                multiple
                                webkitdirectory="true"
                                onChange={handleFileChange}
                                className="hidden"
                                id="album-folder-upload"
                            />
                            <label
                                htmlFor="album-folder-upload"
                                className="w-full flex items-center justify-center flex-col gap-2 bg-[#2a2a3c] border-2 border-dashed border-white/10 rounded-xl px-4 py-6 text-gray-400 cursor-pointer hover:border-green-500/50 hover:bg-green-500/5 transition-all text-center"
                            >
                                <Music className="w-8 h-8 text-green-400/50" />
                                <div className="flex flex-col">
                                    <span className="text-white font-medium">
                                        {songFiles.length > 0 ? `${songFiles.length} songs selected` : 'Click to select music folder'}
                                    </span>
                                    <span className="text-xs text-gray-500">Includes all tracks in the folder</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Disc className="w-4 h-4" /> Album Title
                        </label>
                        <input
                            required
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Automatically sets to folder name"
                            className="w-full bg-[#2a2a3c] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <User className="w-4 h-4" /> Artist
                        </label>
                        <input
                            required
                            type="text"
                            name="artist"
                            value={formData.artist}
                            onChange={handleChange}
                            placeholder="Artist name"
                            className="w-full bg-[#2a2a3c] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Cover Art
                            </label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    name="coverImgFile"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="album-image-upload"
                                />
                                <label
                                    htmlFor="album-image-upload"
                                    className="w-full flex items-center gap-3 bg-[#2a2a3c] border border-white/5 rounded-xl px-4 py-2.5 text-gray-400 cursor-pointer hover:bg-white/5 transition-all"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="truncate text-xs">{coverImgFile ? coverImgFile.name : 'Image...'}</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Release Date
                            </label>
                            <input
                                required
                                type="date"
                                name="releaseDate"
                                value={formData.releaseDate}
                                onChange={handleChange}
                                className="w-full bg-[#2a2a3c] border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none transition-all"
                            />
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
                            className={`flex-1 ${loading ? 'bg-purple-600/50' : 'bg-purple-500 hover:bg-purple-600'} text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20`}
                        >
                            {loading ? 'Adding...' : 'Add Album'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAlbumModal;
