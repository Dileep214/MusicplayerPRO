const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const Album = require('../models/Album');
const User = require('../models/User');

const { authenticateToken, authorizeRoles } = require('../utils/auth');

// GET /api/admin/stats - Get dashboard statistics (Admin Only)
router.get('/stats', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const totalSongs = await Song.countDocuments();
        const totalAlbums = await Album.countDocuments();
        const totalUsers = await User.countDocuments();

        // Count distinct artists
        const distinctArtists = await Song.distinct('artist');
        const totalArtists = distinctArtists.length;

        res.json({
            totalSongs,
            totalAlbums,
            totalArtists,
            totalUsers
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching stats' });
    }
});

module.exports = router;
