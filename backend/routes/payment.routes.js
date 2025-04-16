const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect } = require('../middleware/auth');

// @route    POST /api/complaints/:id/payment
// @desc     Process payment for a complaint
// @access   Private
router.post('/:id/payment', protect, async (req, res) => {
  try {
    const { amount, currency, paymentMethod, cardholderName, cardDetails } = req.body;

    // Find the complaint
    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email doorNumber');

    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    // Check if the complaint belongs to the logged-in user
    if (complaint.user._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to make payment for this complaint' });
    }

    // Check if the complaint is in resolved status
    if (complaint.status !== 'resolved') {
      return res.status(400).json({ msg: 'Payment can only be made for resolved complaints' });
    }

    // Generate a transaction ID
    const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);

    // Get the last 4 digits of the card number
    const cardLastFour = cardDetails?.cardNumber ? cardDetails.cardNumber.slice(-4) : '****';

    // Create payment details
    const paymentDetails = {
      transactionId,
      amount: amount || complaint.paymentAmount || 500, // Use the amount from the request, or the complaint, or default to 500
      currency: currency || 'INR',
      paymentMethod: paymentMethod || 'card',
      cardholderName: cardholderName || complaint.user.name || 'Not provided',
      cardLastFour,
      doorNumber: complaint.user.doorNumber,
      paymentDate: new Date().toISOString(),
      status: 'completed'
    };

    // Update complaint with payment details and change status to closed
    complaint.paymentDetails = paymentDetails;
    complaint.paymentStatus = 'completed';
    complaint.paymentDate = new Date();
    complaint.status = 'closed';

    await complaint.save();

    res.json({ success: true, complaint });
  } catch (err) {
    console.error('Error processing payment:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
