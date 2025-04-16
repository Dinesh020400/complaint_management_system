const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/complaint_db')
  .then(() => {
    console.log('Connected to MongoDB successfully');
    listAllUsers();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function listAllUsers() {
  try {
    // Find all users
    const users = await User.find({}).select('-password');
    
    if (users.length === 0) {
      console.log('No users found in the database');
      process.exit(1);
    }
    
    console.log(`Found ${users.length} users in the database`);
    console.log('\nUSER DETAILS:');
    console.log('=============');
    
    // Print details for each user
    for (const user of users) {
      console.log(`ID: ${user._id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created At: ${user.createdAt}`);
      console.log('-------------------');
    }
    
    // Close the connection
    mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}
