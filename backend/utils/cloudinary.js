const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
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
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB global limit, can be refined per route
});

module.exports = {
    cloudinary,
    upload
};
