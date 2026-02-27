const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Your Music'
    },
    subtitle: {
        type: String,
        default: 'Discover and enjoy your personal music collection.'
    },
    buttonText: {
        type: String,
        default: 'Play Now'
    },
    buttonLink: {
        type: String,
        default: '/library'
    }
}, { timestamps: true });

module.exports = mongoose.model('Banner', BannerSchema);
