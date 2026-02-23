const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function () { return !this.googleId; }, // Required only if googleId is not present
        minlength: 6
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values
    },
    isGoogleAccount: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    profilePhoto: {
        type: String,
        default: null
    },
    refreshTokens: [String], // Store active refresh tokens for rotation
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for email and role for faster lookup during auth
UserSchema.index({ email: 1, role: 1 });

module.exports = mongoose.model('User', UserSchema, 'loginDetails');
