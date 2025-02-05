const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// Create a new request
router.post('/', auth, async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['donation', 'requestorName', 'contactNumber', 'address', 'reason', 'quantity', 'urgency'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Create request object
    const request = new Request({
      ...req.body,
      user: req.user.id,
      status: 'pending'
    });

    // Save request
    const savedRequest = await request.save();
    
    // Populate user and donation details
    await savedRequest.populate('user', 'name email');
    await savedRequest.populate('donation');
    
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Server error:', error); // Add server-side logging
    res.status(400).json({ 
      message: error.message,
      details: error.errors // Include mongoose validation errors if any
    });
  }
});

// Get all requests for a specific donation
router.get('/donation/:donationId', auth, async (req, res) => {
  try {
    const requests = await Request.find({ donation: req.params.donationId })
      .populate('user', 'name email')
      .populate('donation')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user.id })
      .populate('donation')
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