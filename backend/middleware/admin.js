const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

/**
 * Middleware to protect admin routes
 * Verifies if the current user has admin privileges
 */
const adminAuth = async (req, res, next) => {
    try {
        // Check if auth token exists
        const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
            ? req.headers.authorization.split(' ')[1]
            : null;
            
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by id
        const user = await User.findById(decoded.user ? decoded.user.id : decoded.id).select('-password');
        
        // Check if user exists
        if (!user) {
            return res.status(401).json({ msg: 'User not found' });
        }
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin privileges required' });
        }
        
        // Set user data in request object
        req.user = user;
        
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = adminAuth;