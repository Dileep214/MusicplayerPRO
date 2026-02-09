const mongoose = require('mongoose');
const Song = require('./models/Song');
const Album = require('./models/Album');
const Playlist = require('./models/Playlist');
const fs = require('fs');
require('dotenv').config();

const syncAllSongCovers = async () => {
    const log = [];

    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'MusicPlayerPRO' });
        log.push('Connected to MongoDB\n');

        // 1. Sync from Playlists
        const playlists = await Playlist.find().lean();
        log.push(`Processing ${playlists.length} playlists...\n`);

        for (const playlist of playlists) {
            if (playlist.imageUrl && playlist.songs && playlist.songs.length > 0) {
                log.push(`\nPlaylist: "${playlist.name}"\n`);
                log.push(`  Image URL: ${playlist.imageUrl}\n`);
                log.push(`  Song IDs: ${playlist.songs.length}\n`);

                const result = await Song.updateMany(
                    { _id: { $in: playlist.songs } },
                    { $set: { coverImg: playlist.imageUrl } }
                );
                log.push(`  Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}\n`);
            }
        }

        // 2. Sync from Albums
        const albums = await Album.find().lean();
        log.push(`\n\nProcessing ${albums.length} albums...\n`);

        for (const album of albums) {
            if (album.coverImg) {
                log.push(`\nAlbum: "${album.title}"\n`);
                log.push(`  Cover Image: ${album.coverImg}\n`);

                // Update by reference if available
                if (album.songs && album.songs.length > 0) {
                    const result = await Song.updateMany(
                        { _id: { $in: album.songs } },
                        { $set: { coverImg: album.coverImg } }
                    );
                    log.push(`  By ID - Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}\n`);
                }

                // Also update by album title string match
                const result = await Song.updateMany(
                    { album: album.title },
                    { $set: { coverImg: album.coverImg } }
                );
                if (result.matchedCount > 0) {
                    log.push(`  By Title - Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}\n`);
                }
            }
        }

        log.push('\n✅ All song covers synchronized with their respective playlist/album covers.\n');

        const logContent = log.join('');
        console.log(logContent);
        fs.writeFileSync('sync_log.txt', logContent);

        process.exit(0);
    } catch (err) {
        const errorMsg = `❌ Error syncing song covers: ${err}\n`;
        log.push(errorMsg);
        console.error(errorMsg);
        fs.writeFileSync('sync_log.txt', log.join(''));
        process.exit(1);
    }
};

syncAllSongCovers();
