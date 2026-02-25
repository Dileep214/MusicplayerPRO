const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET || 'access_secret_123',
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_123',
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: email.toLowerCase() === 'dileepkomarthi@gmail.com' ? 'admin' : 'user'
        });

        // 5. Save to DB
        await newUser.save();

        // 6. Generate Tokens
        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        // Save refresh token to user
        newUser.refreshTokens.push(refreshToken);
        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            accessToken,
            refreshToken,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // 2. Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // 3. Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 4. Success - Generate Tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token to user
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/refresh
// Implements Refresh Token Rotation
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
    }

    try {
        // 1. Find user with this token
        const user = await User.findOne({ refreshTokens: refreshToken });

        if (!user) {
            // Token Reuse Detection!
            // If the token is valid but NOT in our database, someone might be reusing it.
            // In a production app, you might want to invalidate ALL tokens for this user.
            try {
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_123');
                const hackedUser = await User.findById(decoded.id);
                if (hackedUser) {
                    hackedUser.refreshTokens = []; // Clear all tokens
                    await hackedUser.save();
                }
            } catch (e) { }
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        // 2. Verify token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_123');
        } catch (err) {
            // Remove invalid token
            user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
            await user.save();
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        // 3. Token Rotation: Issue new tokens and remove old ones
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Replace old token with new one
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (err) {
        console.error('Refresh token error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    try {
        if (refreshToken) {
            await User.updateOne(
                { refreshTokens: refreshToken },
                { $pull: { refreshTokens: refreshToken } }
            );
        }
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/google-login
router.post('/google-login', async (req, res) => {
    try {
        const { name, email, googleId, profilePhoto } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({ message: 'Missing Google user info' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // Update googleId if not present
            if (!user.googleId) {
                user.googleId = googleId;
                user.isGoogleAccount = true;
                if (!user.profilePhoto && profilePhoto) {
                    user.profilePhoto = profilePhoto;
                }
                await user.save();
            }
        } else {
            // Create new Google user
            user = new User({
                name: name || email.split('@')[0],
                email,
                googleId,
                isGoogleAccount: true,
                profilePhoto: profilePhoto || null,
                role: email.toLowerCase() === 'dileepkomarthi@gmail.com' ? 'admin' : 'user'
            });
            await user.save();
        }

        // Generate Tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshTokens.push(refreshToken);
        await user.save();

        res.json({
            message: 'Google login successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePhoto: user.profilePhoto
            }
        });

    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
