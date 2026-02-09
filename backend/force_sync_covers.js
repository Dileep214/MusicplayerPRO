const mongoose = require('mongoose');
const Song = require('./models/Song');
const Playlist = require('./models/Playlist');
require('dotenv').config();

const forceSyncAllCovers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'MusicPlayerPRO' });
        console.log('Connected to MongoDB\n');

        // Get all playlists with their songs
        const playlists = await Playlist.find().lean();

        let totalUpdated = 0;

        for (const playlist of playlists) {
            if (playlist.imageUrl && playlist.songs && playlist.songs.length > 0) {
                console.log(`Updating ${playlist.name}...`);

                // Force update even if already set
                const result = await Song.updateMany(
                    { _id: { $in: playlist.songs } },
                    { $set: { coverImg: playlist.imageUrl } },
                    { multi: true }
                );

                console.log(`  Songs updated: ${result.modifiedCount} / ${result.matchedCount}`);
                console.log(`  Image: ${playlist.imageUrl}\n`);

                totalUpdated += result.matchedCount;
            }
        }

        console.log(`\n✅ Total songs processed: ${totalUpdated}`);
        console.log('\nVerifying a few songs...');

        const sampleSongs = await Song.find({}).limit(5);
        sampleSongs.forEach(s => {
            console.log(`  ${s.title} (${s.album}): ${s.coverImg ? '✓ Has cover' : '✗ No cover'}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

forceSyncAllCovers();
