const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
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
    releaseDate: {
        type: Date,
        default: Date.now
    },
    coverImg: {
        type: String, // URL to image
        default: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60'
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

module.exports = mongoose.model('Album', AlbumSchema);
