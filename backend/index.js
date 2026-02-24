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

// Middleware & Performance
app.use(express.json()); // 1. JSON Parsing
app.use(cors()); // 2. CORS
app.use(compression()); // 3. Compression
app.use(helmet()); // Security
app.use(morgan('dev')); // Logger


// Custom Response Time Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (req.originalUrl !== '/health') {
            console.log(`[RES] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
});

// Health Check Endpoint (Lightweight for UptimeRobot)
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests'
});
app.use('/api/', limiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
    res.send('MusicPlayerPRO Backend is running!');
});

// MongoDB Connection (Initialized once)
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { dbName: 'MusicPlayerPRO' })
    .then(() => console.log('✅ MongoDB connection established successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));


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
