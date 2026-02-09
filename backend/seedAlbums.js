const mongoose = require('mongoose');
const Album = require('./models/Album');
require('dotenv').config();

const albums = [
    {
        title: "Hurry Up, We're Dreaming",
        artist: "M83",
        coverImg: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&auto=format&fit=crop&q=60",
        releaseDate: new Date('2011-10-18')
    },
    {
        title: "After Hours",
        artist: "The Weeknd",
        coverImg: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop&q=60",
        releaseDate: new Date('2020-03-20')
    },
    {
        title: "Starboy",
        artist: "The Weeknd",
        coverImg: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=800&auto=format&fit=crop&q=60",
        releaseDate: new Date('2016-11-25')
    },
    {
        title: "Future Nostalgia",
        artist: "Dua Lipa",
        coverImg: "https://images.unsplash.com/photo-1514525253361-bee8a487409e?w=800&auto=format&fit=crop&q=60",
        releaseDate: new Date('2020-03-27')
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'MusicPlayerPRO' });
        console.log('Connected to MongoDB for seeding albums...');

        await Album.deleteMany({});
        await Album.insertMany(albums);

        console.log('✅ Albums seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('❌ Error seeding albums:', err);
        process.exit(1);
    }
};

seedDB();
