const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample user data
const users = [
  {
    name: 'Sindhu',
    email: 'sindhu@example.com',
    password: 'password123',
    doorNumber: 'A101',
    role: 'user'
  },
  {
    name: 'Uma',
    email: 'uma@example.com',
    password: 'password123',
    doorNumber: 'B202',
    role: 'user'
  },
  {
    name: 'Danishwar',
    email: 'danishwar@example.com',
    password: 'password123',
    doorNumber: 'C303',
    role: 'user'
  }
];

// Complaint categories
const categories = [
  'Plumbing',
  'Electrical',
  'Structural',
  'Appliance',
  'Heating/Cooling',
  'Pest Control',
  'Security',
  'Common Area'
];

// Complaint statuses
const statuses = ['pending', 'in-progress', 'resolved', 'closed'];

// Function to create a random complaint
const createComplaint = async (userId, status, index) => {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const title = `${category} Issue ${index + 1}`;

  // Get user details for payment info
  const user = await User.findById(userId);

  const complaint = {
    title,
    description: `This is a ${status} ${category.toLowerCase()} complaint. Detailed description of the issue that needs to be addressed in apartment.`,
    category,
    status,
    user: userId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Add payment details for closed complaints
  if (status === 'closed') {
    complaint.paymentAmount = Math.floor(Math.random() * 5000) + 1000; // Random amount between 1000-6000
    complaint.paymentStatus = 'completed';
    complaint.paymentDate = new Date();
    complaint.paymentDetails = {
      transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
      amount: complaint.paymentAmount,
      currency: 'INR',
      paymentMethod: 'Credit Card',
      cardLastFour: String(Math.floor(1000 + Math.random() * 9000)),
      cardholderName: user ? user.name : 'Card Holder',
      doorNumber: user ? user.doorNumber : 'Unknown'
    };
  }

  // Add response for resolved and closed complaints
  if (status === 'resolved' || status === 'closed') {
    complaint.response = `The ${category.toLowerCase()} issue has been addressed. ${status === 'resolved' ? 'Please make the payment to close this complaint.' : 'Thank you for your payment.'}`;
    complaint.adminComments = `Technician visited and fixed the ${category.toLowerCase()} issue.`;

    // Add payment amount for resolved complaints
    if (status === 'resolved') {
      complaint.paymentAmount = Math.floor(Math.random() * 5000) + 1000; // Random amount between 1000-6000
      complaint.paymentStatus = 'pending';
    }
  }

  return complaint;
};

// Main function to seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({ email: { $in: users.map(u => u.email) } });
    console.log('Existing test users deleted');

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      // Check if door number already exists
      const existingDoor = await User.findOne({ doorNumber: userData.doorNumber });
      if (existingDoor) {
        console.log(`Door number ${userData.doorNumber} already exists. Modifying for ${userData.name}`);
        // Append a random string to make it unique
        userData.doorNumber = `${userData.doorNumber}-${Math.floor(Math.random() * 1000)}`;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        doorNumber: userData.doorNumber,
        role: userData.role
      });

      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`User created: ${userData.name} (${userData.email}) with door ${userData.doorNumber}`);
    }

    // Delete existing complaints for these users
    await Complaint.deleteMany({ user: { $in: createdUsers.map(u => u._id) } });
    console.log('Existing complaints deleted');

    // Create complaints for each user
    for (const user of createdUsers) {
      // Create one complaint of each status for each user
      for (let i = 0; i < statuses.length; i++) {
        const complaint = await createComplaint(user._id, statuses[i], i);
        await Complaint.create(complaint);
        console.log(`Created ${statuses[i]} complaint for ${user.name}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
