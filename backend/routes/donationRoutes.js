const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const upload = require('../config/multer');
const Donation = require('../models/Donation');
const mongoose = require('mongoose');
const User = require('../models/User');
const NGO = require('../models/NGO');
const Volunteer = require('../models/Volunteer');
const Request = require('../models/Request');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

// Get all donations
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donations' });
  }
});

// Get donation stats
router.get('/stats', async (req, res) => {
  try {
    console.log('Fetching stats...');
    
    const counts = {
      donations: await Donation.countDocuments(),
      ngos: await NGO.countDocuments(),
      volunteers: await Volunteer.countDocuments(),
      users: await User.countDocuments(),
      requests: await Request.countDocuments()
    };
    
    console.log('Database counts:', counts);
    
    res.json({
      totalDonations: counts.donations,
      ngoCount: counts.ngos,
      volunteerCount: counts.volunteers,
      userCount: counts.users,
      requestCount: counts.requests
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Donation routes are working' });
});

// Get user's donations
router.get('/my-donations', auth, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const donations = await Donation.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    res.json(donations);
  } catch (error) {
    console.error('Get my donations error:', {
      message: error.message,
      stack: error.stack,
      userId: req.userId
    });
    res.status(500).json({ 
      message: 'Error fetching donations',
      error: error.message 
    });
  }
});

// Create donation with Cloudinary
router.post('/', auth, upload.single('images'), async (req, res) => {
  try {
    let imageUrl;
    if (req.file) {
      imageUrl = await uploadToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        'donations'
      );
    }

    const donationData = {
      ...req.body,
      availability: JSON.parse(req.body.availability),
      location: JSON.parse(req.body.location),
      user: req.userId,
      userId: req.userId,
      donorName: req.user.name,
      images: imageUrl ? [imageUrl] : []
    };

    const donation = new Donation(donationData);
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get donation by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('user', 'name email');
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    // Send auth status along with donation data
    res.json({
      donation,
      isAuthenticated: true,
      user: req.user
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', tokenExpired: true });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donation
router.patch('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user owns the donation
    if (donation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this donation' });
    }

    // Handle all updateable fields
    const updateableFields = [
      'title', 
      'description', 
      'type',
      'quantity',
      'foodType',
      'images',
      'availability',
      'location',
      'status'
    ];

    // Update fields if they exist in request body
    updateableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Parse JSON strings for objects
        if (typeof req.body[field] === 'string' && (field === 'availability' || field === 'location')) {
          try {
            donation[field] = JSON.parse(req.body[field]);
          } catch (e) {
            donation[field] = req.body[field];
          }
        } else {
          donation[field] = req.body[field];
        }
      }
    });

    const updatedDonation = await donation.save();
    
    res.json({
      donation: updatedDonation,
      message: 'Donation updated successfully'
    });
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(400).json({ 
      message: error.message,
      details: 'Failed to update donation'
    });
  }
});

// Delete donation
router.delete('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete image from Cloudinary if exists
    if (donation.images && donation.images.length > 0) {
      for (const imageUrl of donation.images) {
        const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
        await deleteFromCloudinary(publicId);
      }
    }

    await donation.deleteOne();
    res.json({ message: 'Donation removed' });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Public route to get all available donations
router.get('/public', async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'available' })
      .select('-userId') // Exclude sensitive information
      .sort({ createdAt: -1 });
    
    res.json(donations);
  } catch (error) {
    console.error('Error fetching public donations:', error);
    res.status(500).json({ message: 'Error fetching donations' });
  }
});

// Add this new debug route
router.get('/debug-stats', async (req, res) => {
  try {
    const users = await User.find();
    const donations = await Donation.find();
    
    const stats = {
      totalUsers: users.length,
      usersByRole: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}),
      totalDonations: donations.length,
      donations: {
        available: donations.filter(d => d.status === 'available').length,
        pending: donations.filter(d => d.status === 'pending').length,
        completed: donations.filter(d => d.status === 'completed').length
      }
    };

    res.json({
      message: 'Debug Statistics',
      stats,
      rawData: {
        users: users.map(u => ({ id: u._id, role: u.role, email: u.email })),
        donations: donations.map(d => ({ id: d._id, status: d.status }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create', auth, upload.array('images', 5), async (req, res) => {
  try {
    const imageUrls = [];
    if (req.files) {
      for (const file of req.files) {
        const cloudinaryUrl = await uploadToCloudinary(file, 'donations');
        imageUrls.push(cloudinaryUrl);
      }
    }

    const donation = new Donation({
      ...req.body,
      images: imageUrls,
      userId: req.userId
    });

    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update donation status when request is created
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const validStatuses = ['available', 'pending', 'completed', 'requested'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    donation.status = req.body.status;
    const updatedDonation = await donation.save();
    
    res.json({
      donation: updatedDonation,
      message: 'Donation status updated successfully'
    });
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
