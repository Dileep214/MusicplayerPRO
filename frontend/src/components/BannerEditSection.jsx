import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Save, RefreshCw, Upload } from 'lucide-react';
import api from '../api';
import { useMusic } from '../context/MusicContext';

const BannerEditSection = () => {
    const { banner, setBanner, formatUrl } = useMusic();
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [buttonText, setButtonText] = useState('');
    const [buttonLink, setButtonLink] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (banner) {
            setTitle(banner.title || '');
            setSubtitle(banner.subtitle || '');
            setButtonText(banner.buttonText || '');
            setButtonLink(banner.buttonLink || '');
            if (banner.imageUrl) {
                setPreviewUrl(formatUrl(banner.imageUrl));
            }
        }
    }, [banner, formatUrl]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('subtitle', subtitle);
            formData.append('buttonText', buttonText);
            formData.append('buttonLink', buttonLink);
            if (imageFile) {
                formData.append('bannerImage', imageFile);
            }

            const response = await api.put('/api/banner', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setBanner(response.data);
            setSuccess('Banner updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving banner:', err);
            setError(err.response?.data?.message || 'Failed to update banner');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                    <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Edit Home Banner</h2>
                    <p className="text-sm text-white/40">Customize the appearance of your home page banner</p>
                </div>
            </header>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Preview & Upload */}
                <div className="space-y-4">
                    <label className="text-sm font-semibold text-white/60 block px-1">Banner Preview</label>
                    <div className="relative aspect-[21/9] lg:aspect-[16/6] rounded-2xl overflow-hidden border-2 border-dashed border-white/10 group bg-black/40">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                                <ImageIcon className="w-12 h-12 mb-2" />
                                <span className="text-sm font-medium">No banner image set</span>
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                            <Upload className="w-10 h-10 text-white mb-2" />
                            <span className="text-white font-bold">Change Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>

                {/* Right: Text Content */}
                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-white/60 px-1">Banner Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-all"
                            placeholder="Enter catchy title..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-white/60 px-1">Banner Subtitle</label>
                        <textarea
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-all resize-none"
                            placeholder="Enter inviting description..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-white/60 px-1">Button Text</label>
                            <input
                                type="text"
                                value={buttonText}
                                onChange={(e) => setButtonText(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-all"
                                placeholder="e.g. Play Now"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-white/60 px-1">Button Link</label>
                            <input
                                type="text"
                                value={buttonLink}
                                onChange={(e) => setButtonLink(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-all"
                                placeholder="e.g. /library"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between gap-4">
                        <div className="flex-1">
                            {error && <p className="text-red-400 text-sm font-medium animate-pulse">{error}</p>}
                            {success && <p className="text-green-400 text-sm font-medium animate-bounce">{success}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black px-8 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/30"
                        >
                            {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isSaving ? 'Saving...' : 'Save Banner'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BannerEditSection;
