const mongoose = require('mongoose');
const Song = require('./models/Song');
const Album = require('./models/Album');
const Playlist = require('./models/Playlist');
require('dotenv').config();

const updatePlaylistImage = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'MusicPlayerPRO' });
        console.log('Connected to MongoDB');

        const baseUrl = 'http://localhost:3000';
        const dearComradeImg = `${baseUrl}/uploads/images/DearComrade.jpg`;
        const radheShyamImg = `${baseUrl}/uploads/images/Radhe%20shyam.jpg`;

        // Update Dear Comrade
        const dcPlaylist = await Playlist.updateMany(
            { name: /dear comrade/i },
            { $set: { imageUrl: dearComradeImg } }
        );
        console.log(`Updated ${dcPlaylist.modifiedCount} Dear Comrade playlists.`);

        const dcSongs = await Song.updateMany(
            { $or: [{ album: /dear comrade/i }, { artist: /dear comrade/i }] },
            { $set: { coverImg: dearComradeImg } }
        );
        console.log(`Updated ${dcSongs.modifiedCount} Dear Comrade songs.`);

        // also update Radhe Shyam to the local image while we are at it, as requested previously
        const rsPlaylist = await Playlist.updateMany(
            { name: /radheshyam/i },
            { $set: { imageUrl: radheShyamImg } }
        );
        console.log(`Updated ${rsPlaylist.modifiedCount} Radhe Shyam playlists.`);

        const rsSongs = await Song.updateMany(
            { $or: [{ album: /radheshyam/i }, { artist: /radheshyam/i }] },
            { $set: { coverImg: radheShyamImg } }
        );
        console.log(`Updated ${rsSongs.modifiedCount} Radhe Shyam songs.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updatePlaylistImage();
