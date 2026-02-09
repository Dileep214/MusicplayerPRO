const mongoose = require('mongoose');
const Song = require('./models/Song');
require('dotenv').config();

const checkAPI = async () => {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'MusicPlayerPRO' });

    const songs = await Song.find({}).limit(10);

    console.log('Sample of what API returns:\n');
    songs.forEach(song => {
        console.log(`${song.title} (${song.album})`);
        console.log(`  coverImg: ${song.coverImg}\n`);
    });

    process.exit(0);
};

checkAPI();
