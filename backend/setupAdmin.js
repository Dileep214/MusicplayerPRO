const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const ensureAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'MusicPlayerPRO' });
        console.log('Connected to MongoDB...');

        const adminEmail = 'dileepkomarthi@gmail.com';
        const adminPassword = 'Dileep632125889783';

        let user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log('User found, updating to admin...');
            user.role = 'admin';
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(adminPassword, salt);
            await user.save();
            console.log('✅ Admin account updated successfully');
        } else {
            console.log('User not found, creating admin...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const newUser = new User({
                name: 'Dileep Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            await newUser.save();
            console.log('✅ Admin account created successfully');
        }

        process.exit();
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

ensureAdmin();
