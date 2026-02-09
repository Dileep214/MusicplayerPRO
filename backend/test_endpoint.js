const axios = require('axios');

const testProfilePhotoEndpoint = async () => {
    try {
        console.log('Testing if profile photo endpoint exists...\n');

        // Try to hit the endpoint with a test request
        const response = await axios.post('http://localhost:3000/api/user/profile-photo', {
            userId: 'test'
        }, {
            validateStatus: () => true // Accept any status code
        });

        console.log('Status:', response.status);
        console.log('Response:', response.data);

        if (response.status === 404) {
            console.log('\n❌ Endpoint not found! The backend server needs to be restarted.');
            console.log('Please restart the backend server with: node index.js');
        } else if (response.status === 400) {
            console.log('\n✅ Endpoint exists! (Got expected 400 error for missing file)');
        } else {
            console.log('\n✅ Endpoint is responding!');
        }

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Backend server is not running!');
        } else {
            console.log('Error:', error.message);
        }
    }
};

testProfilePhotoEndpoint();
