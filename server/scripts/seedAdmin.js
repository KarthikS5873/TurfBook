require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/turfbook-tn');
    console.log('Database connected for seeding admin...');

    const existingAdmin = await User.findOne({ email: 'admin@turfbooktn.com' });
    if (existingAdmin) {
      console.log('Admin user "admin@turfbooktn.com" already exists in database.');
      process.exit(0);
    }

    // Create the admin user
    await User.create({
      name: 'TN TurfBook Admin',
      email: 'admin@turfbooktn.com',
      password: 'Admin@Password123', // Automatically hashed in pre-save hook
      phone: '9876543210',
      role: 'admin',
      isApproved: true
    });

    console.log('\n=============================================');
    console.log('Admin User Seeded Successfully!');
    console.log('Email:    admin@turfbooktn.com');
    console.log('Password: Admin@Password123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding admin user failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
