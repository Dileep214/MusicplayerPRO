const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Cloudinary Error: Missing credentials in .env file!');
}

cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim()
});

// Create Dynamic Storage
const dynamicStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'MusicPlayerPRO/others';
        let resource_type = 'auto';

        if (file.fieldname === 'audioFile' || file.fieldname === 'songFiles') {
            folder = 'MusicPlayerPRO/songs';
            resource_type = 'video'; // Cloudinary uses 'video' for audio files
        } else if (file.fieldname === 'coverImgFile') {
            folder = 'MusicPlayerPRO/images';
            resource_type = 'image';
        } else if (file.fieldname === 'profilePhoto') {
            folder = 'MusicPlayerPRO/profiles';
            resource_type = 'image';
        }

        return {
            folder: folder,
            resource_type: resource_type,
            allowed_formats: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'jpg', 'png', 'jpeg', 'webp'],
            public_id: Date.now() + '-' + file.originalname.split('.')[0].replace(/ /g, '_'),
        };
    },
});

const upload = multer({
    storage: dynamicStorage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB per file
        fieldSize: 100 * 1024 * 1024 // 100MB for non-file fields
    }
});

module.exports = {
    cloudinary,
    upload
};
