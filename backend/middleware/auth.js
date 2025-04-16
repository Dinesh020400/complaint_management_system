const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Check if token exists in x-auth-token header (for backward compatibility)
  else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  // If no token found in either header
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    console.log('Verifying token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Get user ID from the token (handle different token structures)
    const userId = decoded.user ? decoded.user.id : decoded.id;
    console.log('User ID from token:', userId);

    // Get user from the database (exclude password)
    req.user = await User.findById(userId).select('-password');
    console.log('User from database:', req.user);

    if (!req.user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };