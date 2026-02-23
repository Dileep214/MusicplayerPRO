const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { upload } = require('../utils/cloudinary');
const { authenticateToken } = require('../utils/auth');

// POST /api/user/profile-photo
router.post('/profile-photo', authenticateToken, upload.single('profilePhoto'), async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's profile photo URL
        const photoUrl = req.file.path;
        user.profilePhoto = photoUrl;
        await user.save();

        res.json({
            message: 'Profile photo updated successfully',
            profilePhoto: photoUrl
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/user/favorites
router.get('/favorites', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('favorites').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.favorites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/user/favorites/toggle
router.post('/favorites/toggle', authenticateToken, async (req, res) => {
    try {
        const { songId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const favorites = user.favorites.map(f => f.toString());
        const index = favorites.indexOf(songId.toString());

        if (index === -1) {
            user.favorites.push(songId);
        } else {
            user.favorites.splice(index, 1);
        }
        await user.save();
        res.json({ favorites: user.favorites, message: index === -1 ? 'Added to favorites' : 'Removed from favorites' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
