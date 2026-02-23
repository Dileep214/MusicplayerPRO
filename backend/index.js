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

const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const compression = require('compression');

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging
app.use(compression());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

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

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${err.message}`);
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


module.exports = app;
