const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Song = require('../models/Song');

// Multer Config - Disk Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folder = file.fieldname === 'audioFile' ? 'songs' : 'images';
        const uploadPath = path.join(__dirname, '../uploads', folder);

        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/ /g, '_'));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB limit for audio
    }
});

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

        // Construct base URL for files
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // Set local file paths if uploaded
        if (req.files && req.files['audioFile']) {
            audioUrl = `${baseUrl}/uploads/songs/${req.files['audioFile'][0].filename}`;
        }
        if (req.files && req.files['coverImgFile']) {
            coverImg = `${baseUrl}/uploads/images/${req.files['coverImgFile'][0].filename}`;
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
