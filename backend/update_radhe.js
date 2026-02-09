const mongoose = require('mongoose');
const Song = require('./models/Song');
const Playlist = require('./models/Playlist');
const Album = require('./models/Album');
require('dotenv').config();

const updateRadhe = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'MusicPlayerPRO' });
        console.log('Connected to MongoDB');

        // Look for the Radheshyam playlist or album
        // Based on list_dir, the folder is "Radheshyam"
        const folderName = "Radheshyam";
        const imageUrl = "http://localhost:3000/uploads/images/radhe_shyam.jpg"; // We will assume the user saves it here
        const fallbackUrl = "https://c4.wallpaperflare.com/wallpaper/403/1022/410/movies-radhe-shyam-pooja-hegde-prabhas-hd-wallpaper-preview.jpg";

        let playlist = await Playlist.findOne({ name: new RegExp(folderName, 'i') });
        let album = await Album.findOne({ title: new RegExp(folderName, 'i') });

        if (playlist) {
            playlist.imageUrl = fallbackUrl;
            await playlist.save();
            console.log(`Updated Playlist: ${playlist.name}`);
        }

        if (album) {
            album.coverImg = fallbackUrl;
            await album.save();
            console.log(`Updated Album: ${album.title}`);
        }

        // Update all songs in this album/playlist
        const result = await Song.updateMany(
            { $or: [{ album: new RegExp(folderName, 'i') }, { artist: new RegExp(folderName, 'i') }] },
            { $set: { coverImg: fallbackUrl } }
        );
        console.log(`Updated ${result.modifiedCount} songs.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateRadhe();
