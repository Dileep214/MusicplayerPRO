const mongoose = require('mongoose');
const Song = require('./models/Song');
require('dotenv').config();

const songs = [
    {
        title: "Midnight City",
        artist: "M83",
        album: "Hurry Up, We're Dreaming",
        duration: "4:03",
        category: "Electronic",
        coverImg: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        duration: "3:20",
        category: "Pop",
        coverImg: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title: "Starboy",
        artist: "The Weeknd",
        album: "Starboy",
        duration: "3:50",
        category: "R&B",
        coverImg: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=800&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
        title: "Levitating",
        artist: "Dua Lipa",
        album: "Future Nostalgia",
        duration: "3:23",
        category: "Pop",
        coverImg: "https://images.unsplash.com/photo-1514525253361-bee8a487409e?w=800&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'MusicPlayerPRO' });
        console.log('Connected to MongoDB for seeding...');

        await Song.deleteMany({}); // Optional: clear existing songs
        await Song.insertMany(songs);

        console.log('✅ Songs seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('❌ Error seeding songs:', err);
        process.exit(1);
    }
};

seedDB();
