const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String, // URL to cover image
        default: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop&q=60'
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('Playlist', PlaylistSchema);
