const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const Album = require('../models/Album');
const User = require('../models/User');

// Middleware to check if user is admin (simple check for now)
// In a real app, you would verify the JWT token and check the user role
const isAdmin = async (req, res, next) => {
    // For now, we will just allow everything or you can implement a basic check
    // if (req.user && req.user.role === 'admin') {
    //     next();
    // } else {
    //     res.status(403).json({ message: 'Access denied. Admins only.' });
    // }
    next(); // Placeholder
};

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', isAdmin, async (req, res) => {
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
