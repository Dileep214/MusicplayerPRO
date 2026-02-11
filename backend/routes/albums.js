const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload } = require('../utils/cloudinary');
const Album = require('../models/Album');

// GET /api/albums - Get all albums
router.get('/', async (req, res) => {
    try {
        const albums = await Album.find().populate('songs').sort({ createdAt: -1 });
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
            const songIds = [];

            for (const file of req.files['songFiles']) {
                // Create a Song record for each file
                // We'll use the filename (without extension) as the title
                const songTitle = file.originalname.split('.').slice(0, -1).join('.').replace(/_/g, ' ');

                const newSong = new Song({
                    title: songTitle,
                    artist: artist, // Link to album artist by default
                    album: title,
                    audioUrl: file.path,
                    coverImg: coverImg, // Use album cover as song cover
                    duration: "3:30", // Placeholder duration
                    category: "Album Track"
                });

                const savedSong = await newSong.save();
                songIds.push(savedSong._id);
            }

            newAlbum.songs = songIds;
        }

        await newAlbum.save();
        res.status(201).json(newAlbum);
    } catch (err) {
        console.error('Bulk Album Upload Error:', err);
        res.status(500).json({ message: 'Error uploading album and songs locally', error: err.message });
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
