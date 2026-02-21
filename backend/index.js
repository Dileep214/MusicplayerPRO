const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();


const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songs');
const playlistRoutes = require('./routes/playlists');
const albumRoutes = require('./routes/albums');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

const path = require('path');

const compression = require('compression');

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// MongoDB Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { dbName: 'MusicPlayerPRO' })
    .then(() => console.log('✅ MongoDB connection established successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('MusicPlayerPRO Backend is running!');
});




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


module.exports = app;
