const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect } = require('../middleware/auth');

// @route    POST /api/complaints
// @desc     Submit a complaint
// @access   Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, priority, doorNumber } = req.body;

    // Get user data to include door number
    const user = await require('../models/User').findById(req.user.id);

    const newComplaint = new Complaint({
      user: req.user.id,
      title,
      description,
      category,
      priority: priority || 'medium',
      status: 'pending',
      doorNumber: doorNumber || (user ? user.doorNumber : null) // Use provided door number or get from user
    });

    const complaint = await newComplaint.save();
    res.json(complaint);
  } catch (err) {
    console.error('Error creating complaint:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route    GET /api/complaints
// @desc     Get all complaints of logged-in user
// @access   Private
router.get('/', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id })
      .populate('user', 'name email doorNumber')
      .sort({ createdAt: -1 });
    console.log('Fetched user complaints with populated user data');
    res.json(complaints);
  } catch (err) {
    console.error('Error fetching user complaints:', err.message);
    res.status(500).send('Server error');
  }
});

// @route    PUT /api/complaints/:id
// @desc     Update complaint
// @access   Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    // Check if the complaint belongs to the logged-in user
    if (complaint.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to edit this complaint' });
    }

    // Only allow editing if complaint is in 'pending' status
    if (complaint.status !== 'pending') {
      return res.status(400).json({ msg: 'Cannot edit complaint - it is no longer in pending status' });
    }

    // Update allowed fields
    if (title) complaint.title = title;
    if (description) complaint.description = description;
    if (category) complaint.category = category;
    if (priority) complaint.priority = priority;

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET /api/complaints/:id
// @desc     Get complaint by ID
// @access   Private
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email doorNumber');

    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    // Check if the complaint belongs to the logged-in user
    if (complaint.user._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view this complaint' });
    }

    res.json(complaint);
  } catch (err) {
    console.error('Error fetching complaint:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Complaint not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route    DELETE /api/complaints/:id
// @desc     Delete a complaint
// @access   Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    if (complaint.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await complaint.deleteOne();
    res.json({ msg: 'Complaint removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;