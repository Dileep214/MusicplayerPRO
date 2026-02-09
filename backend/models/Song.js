const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    artist: {
        type: String,
        required: true,
        trim: true
    },
    album: {
        type: String,
        trim: true
    },
    duration: {
        type: String, // e.g., "3:45"
        required: true
    },
    coverImg: {
        type: String, // URL to image
        default: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60'
    },
    audioUrl: {
        type: String, // URL to audio file
        default: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    category: {
        type: String, // e.g., 'Rock', 'Pop', 'Jazz'
        default: 'General'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Song', SongSchema);
