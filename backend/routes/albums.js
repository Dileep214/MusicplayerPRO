const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload } = require('../utils/cloudinary');
const Album = require('../models/Album');

// GET /api/albums - Get all albums (no population for faster load)
router.get('/', async (req, res) => {
    try {
        const albums = await Album.find().sort({ createdAt: -1 }).lean();
        res.json(albums);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching albums' });
    }
});

// POST /api/albums - Add a new album with Bulk Local uploads
router.post('/', (req, res, next) => {
    upload.fields([
        { name: 'coverImgFile', maxCount: 1 },
        { name: 'songFiles', maxCount: 100 } // Support up to 100 songs per album
    ])(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error('Multer Error:', err);
            return res.status(400).json({ message: 'File upload error', error: err.message, code: err.code });
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error('Unknown Upload Error:', err);
            return res.status(500).json({ message: 'Unknown error during upload', error: err.message });
        }
        // Everything went fine.
        next();
    });
}, async (req, res) => {
    try {
        const { title, artist, releaseDate } = req.body;
        const Song = require('../models/Song');

        let coverImg = req.body.coverImg;

        if (req.files && req.files['coverImgFile']) {
            coverImg = req.files['coverImgFile'][0].path;
        }

        // Create the Album first (without songs)
        const newAlbum = new Album({
            title,
            artist,
            coverImg,
            releaseDate: releaseDate || Date.now()
        });

        // Handle Songs if any
        if (req.files && req.files['songFiles']) {
            console.log(`Processing ${req.files['songFiles'].length} songs for album: ${title}`);

            const songsToInsert = req.files['songFiles'].map(file => {
                let originalName = file.originalname;

                // 1. Remove extension
                let titleParts = originalName.split('.');
                let rawTitle = titleParts.length > 1 ? titleParts.slice(0, -1).join('.') : originalName;

                // 2. Decode URL encoding (handles %20, %3A, etc.)
                try {
                    rawTitle = decodeURIComponent(rawTitle);
                } catch (e) {
                    // Fallback to manual replacement if decode fails
                    rawTitle = rawTitle.replace(/%20/g, ' ').replace(/%3A/g, ':');
                }

                // 3. Handle common Android "primary:" prefix
                if (rawTitle.toLowerCase().includes('primary:')) {
                    rawTitle = rawTitle.split(/primary:/i).pop();
                }

                // 4. Clean up characters
                let songTitle = rawTitle
                    .replace(/_/g, ' ')
                    .replace(/-/g, ' ')
                    .replace(/\(\d+\)/g, '') // Remove (1), (2) etc
                    .trim();

                // 5. Capitalize words
                songTitle = songTitle
                    .split(' ')
                    .filter(word => word.length > 0)
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');

                // Final fallback
                if (!songTitle) songTitle = "Track " + (req.files['songFiles'].indexOf(file) + 1);

                return {
                    title: songTitle,
                    artist: artist,
                    album: title,
                    audioUrl: file.path,
                    coverImg: coverImg,
                    duration: "3:30",
                    category: "Album Track"
                };
            });

            const savedSongs = await Song.insertMany(songsToInsert);
            newAlbum.songs = savedSongs.map(s => s._id);
        }

        await newAlbum.save();
        console.log(`✅ Album created successfully: ${title}`);
        res.status(201).json(newAlbum);
    } catch (err) {
        console.error('Bulk Album Upload Error:', err);
        res.status(500).json({
            message: 'Error uploading album and songs',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// DELETE /api/albums/:id - Delete an album
router.delete('/:id', async (req, res) => {
    try {
        await Album.findByIdAndDelete(req.params.id);
        res.json({ message: 'Album deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while deleting album' });
    }
});

module.exports = router;
