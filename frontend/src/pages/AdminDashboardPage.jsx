import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
    Music,
    Disc,
    Users,
    Mic2,
    Plus,
    Trash2,
    LayoutDashboard,
    Search,
    ChevronRight
} from 'lucide-react';
import AddSongModal from '../components/AddSongModal';
import AddAlbumModal from '../components/AddAlbumModal';
import Navbar from '../components/Navbar';
import BackgroundWrapper from '../components/BackgroundWrapper';
import API_URL from '../config';
import { useMusic } from '../context/MusicContext';

const AdminDashboardPage = React.memo(() => {
    const { formatUrl } = useMusic();
    const [stats, setStats] = useState({
        totalSongs: 0,
        totalAlbums: 0,
        totalArtists: 0,
        totalUsers: 0
    });
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [activeTab, setActiveTab] = useState('songs');
    const [isSongModalOpen, setIsSongModalOpen] = useState(false);
    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, songsRes, albumsRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/stats`),
                axios.get(`${API_URL}/api/songs`),
                axios.get(`${API_URL}/api/albums`)
            ]);
            setStats(statsRes.data);
            setSongs(songsRes.data);
            setAlbums(albumsRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteSong = useCallback(async (id) => {
        if (!window.confirm('Are you sure you want to delete this song?')) return;
        try {
            await axios.delete(`${API_URL}/api/songs/${id}`);
            setSongs(prev => prev.filter(song => song._id !== id));
            fetchData(); // Refresh stats
        } catch (error) {
            console.error('Error deleting song:', error);
        }
    }, [fetchData]);

    const handleDeleteAlbum = useCallback(async (id) => {
        if (!window.confirm('Are you sure you want to delete this album?')) return;
        try {
            await axios.delete(`${API_URL}/api/albums/${id}`);
            setAlbums(prev => prev.filter(album => album._id !== id));
            fetchData(); // Refresh stats
        } catch (error) {
            console.error('Error deleting album:', error);
        }
    }, [fetchData]);

    const StatCard = useMemo(() => ({ icon: Icon, label, value, color }) => (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:bg-white/10 transition-all duration-300 group">
            <div className={`p-4 rounded-xl ${color} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    ), []);

    const handleTabChangeSongs = useCallback(() => setActiveTab('songs'), []);
    const handleTabChangeAlbums = useCallback(() => setActiveTab('albums'), []);
    const handleAddClick = useCallback(() => activeTab === 'songs' ? setIsSongModalOpen(true) : setIsAlbumModalOpen(true), [activeTab]);
    const handleCloseSongModal = useCallback(() => setIsSongModalOpen(false), []);
    const handleCloseAlbumModal = useCallback(() => setIsAlbumModalOpen(false), []);

    return (
        <BackgroundWrapper>
            <Navbar />
            <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <LayoutDashboard className="w-8 h-8 text-green-400" />
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">Manage your music catalog and track performance</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard icon={Music} label="Total Songs" value={stats.totalSongs} color="bg-blue-500" />
                    <StatCard icon={Disc} label="Total Albums" value={stats.totalAlbums} color="bg-purple-500" />
                    <StatCard icon={Mic2} label="Total Artists" value={stats.totalArtists} color="bg-orange-500" />
                    <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-green-500" />
                </div>

                {/* Main Content Area */}
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
                    <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl w-fit">
                            <button
                                onClick={handleTabChangeSongs}
                                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'songs' ? 'bg-green-500 text-[#0f0f1a] shadow-lg shadow-green-500/20' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Music className="w-4 h-4" />
                                Songs
                            </button>
                            <button
                                onClick={handleTabChangeAlbums}
                                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'albums' ? 'bg-green-500 text-[#0f0f1a] shadow-lg shadow-green-500/20' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Disc className="w-4 h-4" />
                                Albums
                            </button>
                        </div>

                        <button
                            onClick={handleAddClick}
                            className="bg-green-500 hover:bg-green-600 text-[#0f0f1a] font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/20"
                        >
                            <Plus className="w-5 h-5" />
                            {activeTab === 'songs' ? 'Add Song' : 'Add Album'}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center p-20">
                                <div className="w-10 h-10 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
                            </div>
                        ) : activeTab === 'songs' ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-400 text-sm border-b border-white/5 uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">Title</th>
                                        <th className="px-6 py-4 font-semibold">Artist</th>
                                        <th className="px-6 py-4 font-semibold">Release Date</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {songs.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center text-gray-500">No songs found. Add some to get started!</td>
                                        </tr>
                                    ) : songs.map((song) => (
                                        <tr key={song._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={formatUrl(song.coverImg)}
                                                        alt=""
                                                        loading="lazy"
                                                        className="w-10 h-10 rounded-lg object-cover shadow-lg"
                                                    />
                                                    <span className="font-medium text-white group-hover:text-green-400 transition-colors">{song.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">{song.artist}</td>
                                            <td className="px-6 py-4 text-gray-400 flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center">
                                                    <ChevronRight className="w-3 h-3" />
                                                </div>
                                                {new Date(song.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteSong(song._id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-400 text-sm border-b border-white/5 uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">Album</th>
                                        <th className="px-6 py-4 font-semibold">Artist</th>
                                        <th className="px-6 py-4 font-semibold">Release Date</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {albums.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center text-gray-500">No albums found. Add some to get started!</td>
                                        </tr>
                                    ) : albums.map((album) => (
                                        <tr key={album._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={formatUrl(album.coverImg)}
                                                        alt=""
                                                        loading="lazy"
                                                        className="w-10 h-10 rounded-lg object-cover shadow-lg"
                                                    />
                                                    <span className="font-medium text-white group-hover:text-green-400 transition-colors">{album.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">{album.artist}</td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {new Date(album.releaseDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteAlbum(album._id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <AddSongModal
                isOpen={isSongModalOpen}
                onClose={handleCloseSongModal}
                onSongAdded={fetchData}
            />
            <AddAlbumModal
                isOpen={isAlbumModalOpen}
                onClose={handleCloseAlbumModal}
                onAlbumAdded={fetchData}
            />
        </BackgroundWrapper>
    );
});

export default AdminDashboardPage;
