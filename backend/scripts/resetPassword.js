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
    resetPassword();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function resetPassword() {
  try {
    // Find the user by email
    const user = await User.findOne({ email: 'pavi1@gmail.com' });
    
    if (!user) {
      console.log('User with email pavi1@gmail.com not found');
      process.exit(1);
    }
    
    console.log('Found user:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // Set new password
    const newPassword = '123456'; // Simple password for testing
    
    // Update the password
    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the password
    
    // Verify the password works
    const updatedUser = await User.findOne({ email: 'pavi1@gmail.com' }).select('+password');
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
