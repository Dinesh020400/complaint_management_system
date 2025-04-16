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
    resetUserPassword();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function resetUserPassword() {
  try {
    // Email of the user to reset
    const userEmail = 'dinesh@gmail.com';
    
    // New password
    const newPassword = '147852';
    
    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`User with email ${userEmail} not found`);
      process.exit(1);
    }
    
    console.log('Found user:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // Update the password
    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the password
    
    // Verify the password works
    const updatedUser = await User.findOne({ email: userEmail }).select('+password');
    const passwordMatches = await bcrypt.compare(newPassword, updatedUser.password);
    
    console.log(`Password reset for ${user.email}: ${passwordMatches ? 'SUCCESS' : 'FAILED'}`);
    console.log(`New password is: ${newPassword}`);
    
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}
