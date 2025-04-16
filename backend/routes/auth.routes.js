const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
require('dotenv').config();

// @route    POST /api/auth/register
// @desc     Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, doorNumber, role } = req.body;
    console.log('Register attempt:', { name, email, doorNumber, role });

    // Check if user already exists with this email
    let userWithEmail = await User.findOne({ email });
    if (userWithEmail) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ msg: 'User already exists with this email' });
    }

    // Check if door number is already registered (except for admin)
    if (email !== 'admin@gmail.com' && doorNumber) {
      let userWithDoor = await User.findOne({ doorNumber });
      if (userWithDoor) {
        console.log('Door number already registered:', doorNumber);
        return res.status(400).json({ msg: 'This apartment door number is already registered' });
      }
    }

    // Special case for admin@gmail.com
    const userRole = email === 'admin@gmail.com' ? 'admin' : (role || 'user');

    // Create new user
    const userData = {
      name,
      email,
      password,
      role: userRole
    };

    // Add door number for regular users
    if (userRole === 'user') {
      if (!doorNumber) {
        return res.status(400).json({ msg: 'Door number is required for apartment residents' });
      }
      userData.doorNumber = doorNumber;
    }

    const user = new User(userData);

    // Save user to database - password will be hashed by the pre-save hook
    await user.save();
    console.log('User created:', { id: user._id, role: user.role, doorNumber: user.doorNumber });

    // Create token payload
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    console.log('Creating token with payload:', payload);

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }, // Extend token expiration to 24 hours
      (err, token) => {
        if (err) {
          console.error('Error signing token:', err);
          throw err;
        }

        // Return token and user data
        const userResponse = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        };

        console.log('Registration successful for user:', userResponse);
        res.json({ token, user: userResponse });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route    POST /api/auth/login
// @desc     Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find user by email and explicitly select the password field
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('User found:', {
      id: user._id,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });

    // Check password
    console.log('Comparing password for user:', email);
    console.log('Password from request:', password);

    // Use direct bcrypt compare instead of the model method
    try {
      // Make sure we have the password
      if (!user.password) {
        console.log('User password is missing or not selected');
        return res.status(400).json({ msg: 'Invalid credentials (password missing)' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);

      if (!isMatch) {
        console.log('Password does not match for user:', email);
        return res.status(400).json({
          msg: 'Invalid credentials - password does not match',
          hint: 'Please make sure you are using the password you created during registration.'
        });
      }
    } catch (passwordError) {
      console.error('Error comparing passwords:', passwordError);
      return res.status(500).json({ msg: 'Server error during authentication' });
    }

    // Special case for admin login
    if (email === 'admin@gmail.com' && user.role !== 'admin') {
      console.log('Updating admin role for admin@gmail.com');
      user.role = 'admin';
      await user.save();
    }

    // Create token payload
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    console.log('Creating token with payload:', payload);

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }, // Extend token expiration to 24 hours
      (err, token) => {
        if (err) {
          console.error('Error signing token:', err);
          throw err;
        }

        // Remove password from response
        const userResponse = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        };

        console.log('Login successful for user:', userResponse);
        res.json({ token, user: userResponse });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route    GET /api/auth/user
// @desc     Get authenticated user
router.get('/user', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/auth/test
// @desc     Test route to check if auth routes are working
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ success: true, message: 'Auth routes are working' });
});

// @route    POST /api/auth/direct-login
// @desc     Direct login route that bypasses password check (for testing only)
router.post('/direct-login', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Direct login attempt for email:', email);

    // Find user by email without password
    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);

      // For testing purposes, create a temporary user object
      const isAdmin = email.toLowerCase().includes('admin');
      console.log(`Direct login: Creating temporary ${isAdmin ? 'admin' : 'user'} for ${email}`);

      user = {
        _id: 'direct-' + Date.now(),
        name: isAdmin ? 'Admin User' : 'Regular User',
        email: email,
        role: isAdmin ? 'admin' : 'user'
      };
    }

    console.log('User for direct login:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Create token payload
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('Error signing token:', err);
          throw err;
        }

        // Return token and user data
        const userResponse = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        };

        console.log('Direct login successful for user:', userResponse);
        res.json({ token, user: userResponse });
      }
    );
  } catch (err) {
    console.error('Direct login error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route    POST /api/auth/test-login
// @desc     Test login route that doesn't require authentication
router.post('/test-login', (req, res) => {
  console.log('Test login route hit with body:', req.body);

  // Check if we received the expected data
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      received: req.body
    });
  }

  // Determine the role based on email
  const isAdmin = req.body.email.toLowerCase().includes('admin');
  console.log(`Test login: Setting role to ${isAdmin ? 'admin' : 'user'} for email ${req.body.email}`);

  // Return a success response for testing
  res.json({
    success: true,
    message: 'Test login successful',
    token: 'test-token-' + Date.now(), // Add timestamp to prevent caching issues
    user: {
      id: 'test-id-' + Date.now(),
      name: isAdmin ? 'Admin User' : 'Regular User',
      email: req.body.email,
      role: isAdmin ? 'admin' : 'user'
    }
  });
});

// @route    GET /api/auth/verify
// @desc     Verify user token and return user data
router.get('/verify', protect, async (req, res) => {
  try {
    console.log('Verify endpoint - req.user:', req.user);

    // Double-check that we have a valid user
    if (!req.user || !req.user.id) {
      console.log('No valid user in request');
      return res.status(401).json({
        success: false,
        message: 'Invalid user data in token'
      });
    }

    // Get fresh user data from database
    const user = await User.findById(req.user.id).select('-password');
    console.log('User from database:', user);

    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return success with user data
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error in verify endpoint:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;