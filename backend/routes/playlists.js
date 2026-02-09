const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');

// GET /api/playlists - Get all playlists
router.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find().populate('songs').sort({ createdAt: -1 });
        res.json(playlists);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching playlists' });
    }
});

// GET /api/playlists/:id - Get a single playlist with songs
router.get('/:id', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id).populate('songs');
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        res.json(playlist);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching playlist' });
    }
});

// POST /api/playlists - Create a new playlist
router.post('/', async (req, res) => {
    try {
        const { name, description, imageUrl } = req.body;
        const newPlaylist = new Playlist({ name, description, imageUrl });
        await newPlaylist.save();
        res.status(201).json(newPlaylist);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while creating playlist' });
    }
});

module.exports = router;
