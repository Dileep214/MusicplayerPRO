const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload } = require('../utils/cloudinary');
const { cacheMiddleware } = require('../utils/cache');
const Album = require('../models/Album');

// GET /api/albums - Get all albums (cached for 5 minutes)
router.get('/', cacheMiddleware(300), async (req, res) => {
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

// GET /api/albums/:id - Get album detail with populated songs
router.get('/:id', async (req, res) => {
    try {
        const Song = require('../models/Song');
        const album = await Album.findById(req.params.id).lean();
        if (!album) return res.status(404).json({ message: 'Album not found' });

        // Populate songs
        const songs = await Song.find({ _id: { $in: album.songs || [] } }).lean();
        res.json({ ...album, songs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching album' });
    }
});

// PATCH /api/albums/:id/cover - Update album cover image
router.patch('/:id/cover', (req, res, next) => {
    upload.fields([{ name: 'coverImgFile', maxCount: 1 }])(req, res, (err) => {
        if (err) return res.status(400).json({ message: 'Upload error', error: err.message });
        next();
    });
}, async (req, res) => {
    try {
        let coverImg = req.body.coverImg;
        if (req.files && req.files['coverImgFile']) {
            coverImg = req.files['coverImgFile'][0].path;
        }
        if (!coverImg) return res.status(400).json({ message: 'No cover image provided' });

        const album = await Album.findByIdAndUpdate(
            req.params.id,
            { coverImg },
            { new: true }
        );
        if (!album) return res.status(404).json({ message: 'Album not found' });
        res.json({ message: 'Cover updated', album });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while updating cover' });
    }
});

// PATCH /api/albums/:id/add-songs - Add songs to an album
router.patch('/:id/add-songs', (req, res, next) => {
    upload.fields([{ name: 'songFiles', maxCount: 50 }])(req, res, (err) => {
        if (err) return res.status(400).json({ message: 'Upload error', error: err.message });
        next();
    });
}, async (req, res) => {
    try {
        const Song = require('../models/Song');
        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ message: 'Album not found' });

        if (!req.files || !req.files['songFiles'] || req.files['songFiles'].length === 0) {
            return res.status(400).json({ message: 'No song files provided' });
        }

        const songsToInsert = req.files['songFiles'].map((file, idx) => {
            let rawTitle = file.originalname.split('.').slice(0, -1).join('.') || file.originalname;
            try { rawTitle = decodeURIComponent(rawTitle); } catch (e) { }
            rawTitle = rawTitle.replace(/primary:/i, '').replace(/_/g, ' ').replace(/-/g, ' ').replace(/\(\d+\)/g, '').trim();
            const songTitle = rawTitle.split(' ').filter(w => w).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || `Track ${idx + 1}`;

            return {
                title: songTitle,
                artist: album.artist,
                album: album.title,
                audioUrl: file.path,
                coverImg: album.coverImg,
                duration: '3:30',
                category: 'Album Track'
            };
        });

        const savedSongs = await Song.insertMany(songsToInsert);
        album.songs.push(...savedSongs.map(s => s._id));
        await album.save();

        res.json({ message: `${savedSongs.length} song(s) added to album`, songs: savedSongs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while adding songs', error: err.message });
    }
});

// DELETE /api/albums/:id/songs/:songId - Remove a song from an album (and delete the song)
router.delete('/:id/songs/:songId', async (req, res) => {
    try {
        const Song = require('../models/Song');
        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ message: 'Album not found' });

        // Remove song ref from album
        album.songs = album.songs.filter(s => String(s) !== req.params.songId);
        await album.save();

        // Delete the song document
        await Song.findByIdAndDelete(req.params.songId);

        res.json({ message: 'Song removed from album' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while removing song' });
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
