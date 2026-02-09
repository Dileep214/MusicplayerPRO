const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Song = require('./models/Song');
const Playlist = require('./models/Playlist');
require('dotenv').config();

const UPLOADS_PATH = path.join(__dirname, 'uploads/songs');
const BASE_URL = 'http://localhost:3000'; // Change this if your port is different

const sync = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'MusicPlayerPRO' });
        console.log('✅ Connected to MongoDB for syncing...');

        // Read the songs directory
        const folders = fs.readdirSync(UPLOADS_PATH);

        for (const folder of folders) {
            const folderPath = path.join(UPLOADS_PATH, folder);

            // Skip if it's not a directory
            if (!fs.statSync(folderPath).isDirectory()) continue;

            console.log(`\nProcessing folder (Playlist): ${folder}`);

            // Find or create playlist
            let playlist = await Playlist.findOne({ name: folder });
            if (!playlist) {
                playlist = new Playlist({
                    name: folder,
                    description: `Playlist for ${folder}`,
                    songs: []
                });
                console.log(`  + Created playlist: ${folder}`);
            } else {
                console.log(`  * Found existing playlist: ${folder}`);
                // Clear existing songs to avoid duplicates if you want a fresh sync
                // playlist.songs = []; 
            }

            // Read songs inside the folder
            const files = fs.readdirSync(folderPath);
            const songIds = [];

            for (const file of files) {
                if (!file.endsWith('.mp3')) continue;

                // Simple title parsing: "01 - SongName.mp3" -> "SongName"
                let title = file.replace(/^\d+[-_ ]+/, '').replace('.mp3', '').replace(/_/g, ' ');
                title = title.trim();

                const audioUrl = `${BASE_URL}/uploads/songs/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;

                // Check if song already exists with this URL
                let song = await Song.findOne({ audioUrl });

                if (!song) {
                    song = new Song({
                        title: title,
                        artist: folder, // Defaulting artist to folder name
                        album: folder,  // Defaulting album to folder name
                        duration: '0:00', // We can't easily get duration without a library like music-metadata
                        audioUrl: audioUrl,
                        coverImg: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60',
                        category: 'General'
                    });
                    await song.save();
                    console.log(`    + Added song: ${title}`);
                } else {
                    console.log(`    * Song already exists: ${title}`);
                }

                if (!playlist.songs.includes(song._id)) {
                    songIds.push(song._id);
                }
            }

            // Update playlist songs
            playlist.songs = [...new Set([...playlist.songs, ...songIds])];
            await playlist.save();
            console.log(`  ✅ Playlist ${folder} updated with ${songIds.length} new songs.`);
        }

        console.log('\n🚀 Sync completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error syncing:', err);
        process.exit(1);
    }
};

sync();
