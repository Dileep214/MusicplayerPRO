const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary configuration:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);

cloudinary.api.ping()
    .then(result => {
        console.log('✅ Cloudinary Connection Successful:', result);
    })
    .catch(error => {
        console.error('❌ Cloudinary Connection Failed:');
        console.error(error.message);
        if (error.error && error.error.message) {
            console.error('Details:', error.error.message);
        }
    });
