const express = require('express');
const router = express.Router();
const { upload } = require('../utils/cloudinary');
const Banner = require('../models/Banner');
const { authenticateToken, authorizeRoles } = require('../utils/auth');

// GET /api/banner - Get the current banner
router.get('/', async (req, res) => {
    try {
        let banner = await Banner.findOne();
        if (!banner) {
            // Return a default if none exists
            return res.json({
                imageUrl: '',
                title: 'Your Music',
                subtitle: 'Discover and enjoy your personal music collection.',
                buttonText: 'Play Now',
                buttonLink: '/library'
            });
        }
        res.json(banner);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching banner' });
    }
});

// PUT /api/banner - Update the banner (Admin Only)
router.put('/', authenticateToken, authorizeRoles('admin'), upload.single('bannerImage'), async (req, res) => {
    try {
        const { title, subtitle, buttonText, buttonLink } = req.body;
        let imageUrl = req.body.imageUrl;

        if (req.file) {
            imageUrl = req.file.path;
        }

        let banner = await Banner.findOne();
        if (banner) {
            banner.title = title || banner.title;
            banner.subtitle = subtitle || banner.subtitle;
            banner.buttonText = buttonText || banner.buttonText;
            banner.buttonLink = buttonLink || banner.buttonLink;
            banner.imageUrl = imageUrl || banner.imageUrl;
            await banner.save();
        } else {
            banner = new Banner({
                title,
                subtitle,
                buttonText,
                buttonLink,
                imageUrl
            });
            await banner.save();
        }

        res.json(banner);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while updating banner' });
    }
});

module.exports = router;
