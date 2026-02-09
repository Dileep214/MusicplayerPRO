const mongoose = require('mongoose');
const Song = require('./models/Song');
require('dotenv').config();

const checkSongs = async () => {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'MusicPlayerPRO' });

    const radheSongs = await Song.find({ album: 'Radheshyam' }).limit(3);
    console.log('\nRadheshyam Songs:');
    radheSongs.forEach(s => console.log(`  ${s.title}: ${s.coverImg}`));

    const dearSongs = await Song.find({ album: /dear comrade/i }).limit(3);
    console.log('\nDear Comrade Songs:');
    dearSongs.forEach(s => console.log(`  ${s.title}: ${s.coverImg}`));

    process.exit(0);
};

checkSongs();
