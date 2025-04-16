const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/complaint_db')
  .then(() => {
    console.log('Connected to MongoDB successfully');
    createTestUsers();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createTestUsers() {
  try {
    // Create test users
    const users = [
      {
        name: 'Test User',
        email: 'user@test.com',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin1234',
        role: 'admin'
      },
      {
        name: 'New Test User',
        email: 'newtest@example.com',
        password: 'test12345',
        role: 'user'
      },
      {
        name: 'Custom Password User',
        email: 'custom@example.com',
        password: 'MyCustomP@ssw0rd',
        role: 'user'
      }
    ];

    for (const userData of users) {
      // Check if user already exists
      const userExists = await User.findOne({ email: userData.email });

      if (userExists) {
        console.log(`User ${userData.email} already exists. Deleting...`);
        await User.deleteOne({ email: userData.email });
      }

      // Create user with the User model (which will hash the password via pre-save hook)
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: userData.password, // This will be hashed by the pre-save hook
        role: userData.role
      });

      await user.save();

      // Verify the password works
      const savedUser = await User.findOne({ email: userData.email }).select('+password');
      const passwordMatches = await bcrypt.compare(userData.password, savedUser.password);

      console.log(`User ${userData.email} created successfully with password: ${userData.password}`);
      console.log(`Password verification: ${passwordMatches ? 'SUCCESS' : 'FAILED'}`);
    }

    // Print all user credentials
    console.log('\nTEST USER CREDENTIALS:');
    console.log('=====================');
    for (const userData of users) {
      console.log(`Email: ${userData.email} | Password: ${userData.password} | Role: ${userData.role}`);
    }

    console.log('\nTest users created successfully');
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}