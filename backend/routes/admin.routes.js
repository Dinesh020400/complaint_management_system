const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ─────── Complaint Management ───────

// Get all complaints
router.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('user', 'name email');
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get complaint by ID
router.get('/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email');
    if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update complaint status
router.put('/complaints/:id', async (req, res) => {
  try {
    const { status, adminComments, assignedTo, paymentAmount, paymentStatus } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

    complaint.status = status || complaint.status;
    complaint.adminComments = adminComments || complaint.adminComments;
    complaint.assignedTo = assignedTo || complaint.assignedTo;

    // Handle payment amount and status if provided
    if (paymentAmount !== undefined) {
      complaint.paymentAmount = paymentAmount;
      console.log(`Setting payment amount to ${paymentAmount} for complaint ${complaint._id}`);
    }

    if (paymentStatus) {
      complaint.paymentStatus = paymentStatus;
      console.log(`Setting payment status to ${paymentStatus} for complaint ${complaint._id}`);
    }

    await complaint.save();

    res.json({ success: true, complaint });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete complaint
router.delete('/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

    await complaint.deleteOne();
    res.json({ msg: 'Complaint deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─────── User Management ───────

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update user role
router.put('/users/:id', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ msg: 'User role updated', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Reset user password
router.put('/users/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Update the password
    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the password

    res.json({ msg: 'User password reset successfully' });
  } catch (err) {
    console.error('Password reset error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Delete user and all associated complaints
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Delete all complaints associated with this user
    const deleteComplaintsResult = await Complaint.deleteMany({ user: req.params.id });
    console.log(`Deleted ${deleteComplaintsResult.deletedCount} complaints associated with user ${req.params.id}`);

    // Delete the user
    await user.deleteOne();

    res.json({
      msg: 'User deleted successfully',
      complaintsDeleted: deleteComplaintsResult.deletedCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─────── Dashboard Stats ───────

// Total complaints, users, and statuses
router.get('/stats', async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'pending' });
    const inProgress = await Complaint.countDocuments({ status: 'in-progress' });
    const resolved = await Complaint.countDocuments({ status: 'resolved' });
    const rejected = await Complaint.countDocuments({ status: 'rejected' });
    const closed = await Complaint.countDocuments({ status: 'closed' });
    const users = await User.countDocuments({ role: 'user' });

    res.json({
      totalComplaints,
      pending,
      inProgress,
      resolved,
      rejected,
      closed,
      users
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Monthly complaints (example: count by month)
router.get('/stats/monthly', async (req, res) => {
  try {
    const monthlyStats = await Complaint.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    res.json(monthlyStats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;