import React, { useState, useRef, useCallback, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import API_URL from '../config';
import { useMusic } from '../context/MusicContext';
import { Camera, User as UserIcon } from 'lucide-react';

const ProfilePage = React.memo(() => {
    const { formatUrl, stopPlayback, user, updateUser } = useMusic();
    const navigate = useNavigate();

    const [uploading, setUploading] = useState(false);
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('user_preferences');
        return saved ? JSON.parse(saved) : {
            notif: true,
            auto: true,
            hq: false
        };
    });

    const fileInputRef = useRef(null);

    const handleLogout = useCallback(() => {
        stopPlayback();
        localStorage.clear(); // Clear all to be safe
        navigate('/login');
    }, [navigate, stopPlayback]);

    const handlePhotoClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handlePreferenceToggle = (id) => {
        setPreferences(prev => {
            const next = { ...prev, [id]: !prev[id] };
            localStorage.setItem('user_preferences', JSON.stringify(next));
            return next;
        });
    };

    const handlePhotoChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('profilePhoto', file);

            const response = await api.post(`/api/user/profile-photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newPhotoUrl = response.data.profilePhoto;

            // Update global state
            updateUser({ profilePhoto: newPhotoUrl });

            alert('Profile photo updated successfully!');
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert(`Failed to upload photo: ${error.response?.data?.message || error.message}`);
        } finally {
            setUploading(false);
        }
    }, [updateUser]);

    const userInitial = useMemo(() =>
        (user?.name || 'U').charAt(0).toUpperCase(),
        [user?.name]
    );

    const handleSave = () => {
        alert('Preferences saved successfully!');
    };

    if (!user) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh] text-white">
                    <p>Please log in to view your profile.</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">Profile Settings</h1>
                    <p className="text-white/50">Manage your account and preferences</p>
                </div>

                {/* Profile Photo Section */}
                <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-purple-600 p-1">
                                <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                                    {user.profilePhoto ? (
                                        <img
                                            src={formatUrl(user.profilePhoto)}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <span className="text-5xl font-bold text-white">
                                            {userInitial}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handlePhotoClick}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all shadow-lg disabled:opacity-50"
                            >
                                {uploading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Camera className="w-5 h-5 text-white" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </div>
                        <p className="mt-4 text-white/40 text-sm">Click the camera icon to update your photo</p>
                    </div>
                </div>

                {/* Account Information */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-white/40 text-xs uppercase tracking-wider font-semibold mb-2">
                                Name
                            </label>
                            <input
                                readOnly
                                type="text"
                                value={user.name || 'Guest'}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-white/40 text-xs uppercase tracking-wider font-semibold mb-2">
                                Email
                            </label>
                            <input
                                readOnly
                                type="email"
                                value={user.email || ''}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Playback Preferences</h2>

                    <div className="space-y-3">
                        {[
                            { id: 'notif', label: 'Push Notifications', desc: 'Get notified about new releases' },
                            { id: 'auto', label: 'Auto-play Next Track', desc: 'Continuous playback experience' },
                            { id: 'hq', label: 'High Quality Audio', desc: 'Stream in higher quality' }
                        ].map((setting) => (
                            <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                                <div>
                                    <p className="text-white font-semibold">{setting.label}</p>
                                    <p className="text-white/40 text-sm">{setting.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={preferences[setting.id]}
                                        onChange={() => handlePreferenceToggle(setting.id)}
                                    />
                                    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-500/30 transition-all">
                                        <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        className="flex-1 px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-white/90 transition-all"
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 border border-white/10 transition-all"
                    >
                        Log Out
                    </button>
                </div>

            </div>
        </MainLayout>
    );
});
export default ProfilePage;

