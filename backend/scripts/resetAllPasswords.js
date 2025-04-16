const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/complaint_db')
  .then(() => {
    console.log('Connected to MongoDB successfully');
    resetAllPasswords();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function resetAllPasswords() {
  try {
    // Find all users
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found in the database');
      process.exit(1);
    }
    
    console.log(`Found ${users.length} users in the database`);
    
    // Reset password for each user
    for (const user of users) {
      // Set new password - using the email username as password for simplicity
      // This makes it easy for users to remember their password
      const emailUsername = user.email.split('@')[0];
      const newPassword = emailUsername + '123'; // Adding 123 for minimal security
      
      console.log(`Resetting password for ${user.email} to ${newPassword}`);
      
      // Update the password
      user.password = newPassword;
      await user.save(); // This will trigger the pre-save hook to hash the password
      
      // Verify the password works
      const updatedUser = await User.findOne({ email: user.email }).select('+password');
      const passwordMatches = await bcrypt.compare(newPassword, updatedUser.password);
      
      console.log(`Password reset for ${user.email}: ${passwordMatches ? 'SUCCESS' : 'FAILED'}`);
    }
    
    // Print a summary of all users with their new passwords
    console.log('\nSUMMARY OF USER CREDENTIALS:');
    console.log('============================');
    
    for (const user of users) {
      const emailUsername = user.email.split('@')[0];
      const newPassword = emailUsername + '123';
      console.log(`${user.email} | ${newPassword} | Role: ${user.role}`);
    }
    
    // Close the connection
    mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  } catch (error) {
    console.error('Error resetting passwords:', error);
    process.exit(1);
  }
}
