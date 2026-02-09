const mongoose = require('mongoose');
const Playlist = require('./models/Playlist');
require('dotenv').config();

const playlists = [
    { name: "Top Hits", description: "The hottest tracks right now" },
    { name: "Focus Flow", description: "Instrumental beats for concentration" },
    { name: "Workout", description: "Get your heart racing" },
    { name: "Chill Vibes", description: "Relax and unwind" },
    { name: "Party Mix", description: "Dancing fuel" },
    { name: "Retro Hits", description: "The best of the 80s and 90s" },
    { name: "Classical", description: "Timeless masterpieces" },
    { name: "Coding Beats", description: "Music to code to" },
    { name: "Rainy Day", description: "Cozy acoustic tracks" },
    { name: "Jazz Night", description: "Smooth sax and piano" },
    { name: "Rock Legends", description: "The greatest anthems" },
    { name: "Indie Gems", description: "New sounds from independent artists" }
];

const seedPlaylists = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'MusicPlayerPRO' });
        console.log('Connected to MongoDB for seeding playlists...');

        await Playlist.deleteMany({});
        await Playlist.insertMany(playlists);

        console.log('✅ Playlists seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('❌ Error seeding playlists:', err);
        process.exit(1);
    }
};

seedPlaylists();
