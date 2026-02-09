const mongoose = require('mongoose');
const Song = require('./models/Song');
require('dotenv').config();

const checkAllSongs = async () => {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'MusicPlayerPRO' });

    console.log('\n=== CHECKING ALL SONGS ===\n');

    const allSongs = await Song.find({}).sort({ album: 1 });

    let currentAlbum = '';
    allSongs.forEach(song => {
        if (song.album !== currentAlbum) {
            currentAlbum = song.album;
            console.log(`\n--- ${currentAlbum} ---`);
        }
        console.log(`  ${song.title}`);
        console.log(`    Cover: ${song.coverImg}`);
    });

    console.log(`\n\nTotal songs: ${allSongs.length}`);

    process.exit(0);
};

checkAllSongs();
