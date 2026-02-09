const express = require('express');
const router = express.Router();
const { upload } = require('../utils/cloudinary');
const Song = require('../models/Song');

// GET /api/songs - Get all songs
router.get('/', async (req, res) => {
    try {
        const songs = await Song.find().sort({ createdAt: -1 });
        res.json(songs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching songs' });
    }
});

// POST /api/songs - Add a new song with Local uploads
router.post('/', upload.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'coverImgFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, artist, album, duration, category } = req.body;

        let audioUrl = req.body.audioUrl;
        let coverImg = req.body.coverImg;

        // Set Cloudinary file paths if uploaded
        if (req.files && req.files['audioFile']) {
            audioUrl = req.files['audioFile'][0].path;
        }
        if (req.files && req.files['coverImgFile']) {
            coverImg = req.files['coverImgFile'][0].path;
        }

        const newSong = new Song({
            title,
            artist,
            album,
            duration,
            coverImg,
            audioUrl,
            category
        });

        await newSong.save();
        res.status(201).json(newSong);
    } catch (err) {
        console.error('File Upload Error:', err);
        res.status(500).json({ message: 'Error uploading files locally', error: err.message });
    }
});

// DELETE /api/songs/:id - Delete a song
router.delete('/:id', async (req, res) => {
    try {
        await Song.findByIdAndDelete(req.params.id);
        res.json({ message: 'Song deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while deleting song' });
    }
});

module.exports = router;
