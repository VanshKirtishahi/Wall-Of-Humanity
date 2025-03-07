const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const auth = require('../middleware/auth');
const Donation = require('../models/Donation');

// Create new request
router.post('/', auth, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { 
      donation,
      requestorName,
      contactNumber,
      address,
      reason,
      urgency,
      status
    } = req.body;

    // Validate required fields
    if (!donation) {
      return res.status(400).json({ 
        message: 'Donation ID is required',
        receivedData: req.body 
      });
    }

    // Find the donation
    const donationDoc = await Donation.findById(donation);
    if (!donationDoc) {
      return res.status(404).json({ 
        message: 'Donation not found',
        donationId: donation 
      });
    }

    // Check if donation is already requested
    if (donationDoc.status === 'requested') {
      return res.status(400).json({ 
        message: 'This donation has already been requested',
        currentStatus: donationDoc.status 
      });
    }

    // Create new request with quantity from donation if not provided
    const request = new Request({
      donation,
      user: req.userId,
      requestorName,
      contactNumber,
      address,
      reason,
      urgency: urgency || 'normal',
      status: status || 'pending'
    });

    await request.save();

    // Update donation status
    donationDoc.status = 'requested';
    await donationDoc.save();

    res.status(201).json({
      request,
      message: 'Request submitted successfully',
      donationStatus: donationDoc.status
    });
  } catch (error) {
    console.error('Create request error:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.userId
    });
    
    res.status(400).json({
      message: 'Failed to create request',
      error: error.message,
      details: {
        receivedData: req.body,
        errorName: error.name
      }
    });
  }
});

// Get all requests for a user
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.userId })
      .populate('donation')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get requests for a specific donation
router.get('/donation/:donationId', auth, async (req, res) => {
  try {
    const requests = await Request.find({ donation: req.params.donationId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update request status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = req.body.status;
    const updatedRequest = await request.save();
    
    await updatedRequest.populate('user', 'name email');
    await updatedRequest.populate('donation');
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete request
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only allow users to delete their own requests
    if (request.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await request.deleteOne();
    res.json({ message: 'Request removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 