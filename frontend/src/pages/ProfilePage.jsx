import React, { useState, useRef } from 'react';
import BackgroundWrapper from '../components/BackgroundWrapper';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

const ProfilePage = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const [name, setName] = useState(userData.name || '');
    const [email, setEmail] = useState(userData.email || '');
    const [profilePhoto, setProfilePhoto] = useState(userData.profilePhoto || null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('profilePhoto', file);
            formData.append('userId', userData._id);

            const response = await axios.post(`${API_URL}/api/user/profile-photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const newPhotoUrl = response.data.profilePhoto;
            setProfilePhoto(newPhotoUrl);

            // Update localStorage
            const updatedUser = { ...userData, profilePhoto: newPhotoUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            alert('Profile photo updated successfully!');
        } catch (error) {
            console.error('Error uploading photo:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error occurred';
            alert(`Failed to upload photo: ${errorMsg}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <BackgroundWrapper>
            {/* Layer 1: Fullscreen Background has flex centering provided by this wrapper div */}
            <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8">

                <Navbar />

                {/* 
                    Layer 2: App Container 
                    - Managed size: full width on mobile, capped on desktop
                    - Fixed max-height with internal scrolling
                    - Glassmorphism effect
                */}
                <div className="relative mt-8 w-full max-w-[95%] md:max-w-7xl max-h-[75vh] 
                    backdrop-blur-3xl bg-white/[0.06] border border-white/20 rounded-[40px] 
                    shadow-[0_24px_80px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
                >

                    {/* Internal Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

                        {/* Header Section */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Settings</h1>
                            <p className="text-white/50 text-sm md:text-base">Manage your account and app preferences</p>
                        </div>

                        {/* Profile Photo Section */}
                        <div className="flex flex-col items-center group">
                            <div className="relative pointer-events-auto">
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-white/20 via-white/10 to-transparent border-2 border-white/30 flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-105 overflow-hidden">
                                    {profilePhoto ? (
                                        <img
                                            src={profilePhoto}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl md:text-5xl font-bold text-white selection:bg-transparent">
                                            {name.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handlePhotoClick}
                                    disabled={uploading}
                                    className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-white/10 border border-white/40 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <svg className="w-5 h-5 text-white/90 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
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
                        </div>

                        {/* User Inputs Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-white/40 text-xs uppercase tracking-widest font-bold ml-1">Name</label>
                                <input
                                    readOnly
                                    type="text"
                                    value={name}
                                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/5 text-white/50 cursor-not-allowed font-medium select-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-white/40 text-xs uppercase tracking-widest font-bold ml-1">Email</label>
                                <input
                                    readOnly
                                    type="email"
                                    value={email}
                                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/5 text-white/50 cursor-not-allowed font-medium select-none"
                                />
                            </div>
                        </div>

                        {/* App Settings Section */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-white/40 text-xs uppercase tracking-widest font-bold ml-1">Privacy & Playback</h3>

                            <div className="space-y-3">
                                {[
                                    { id: 'notif', label: 'Push Notifications', desc: 'Alerts for new releases and features', checked: true },
                                    { id: 'auto', label: 'Auto-play Next Track', desc: 'Never stop the music flow', checked: true },
                                    { id: 'hq', label: 'High Fidelity Audio', desc: 'Stream in lossless CD quality', checked: false }
                                ].map((setting) => (
                                    <div key={setting.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all cursor-pointer group">
                                        <div className="pr-4">
                                            <p className="text-white font-semibold">{setting.label}</p>
                                            <p className="text-white/40 text-sm font-medium">{setting.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer scale-110">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={setting.checked} />
                                            <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/30 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40 peer-checked:after:bg-white"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar: Fixed inside container */}
                    <div className="p-8 md:p-10 bg-white/[0.02] border-t border-white/10 flex flex-col md:flex-row gap-4">
                        <button className="flex-1 px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-white/90 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                            Save Changes
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex-1 px-8 py-4 bg-transparent border border-white/10 text-white/70 rounded-2xl font-bold hover:bg-white/5 hover:text-white transition-all active:scale-95"
                        >
                            Log Out
                        </button>
                    </div>

                </div>
            </div>
        </BackgroundWrapper>
    );
};

export default ProfilePage;
