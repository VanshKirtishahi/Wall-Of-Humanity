const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Donation = require('../models/Donation');
const mongoose = require('mongoose');
const multer = require('multer');
const User = require('../models/User');
const NGO = require('../models/NGO');
const Volunteer = require('../models/Volunteer');
const Request = require('../models/Request');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/donations');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const uploadMulter = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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

// Create donation
router.post('/', auth, upload.single('images'), async (req, res) => {
  try {
    const donationData = {
      ...req.body,
      availability: JSON.parse(req.body.availability),
      location: JSON.parse(req.body.location),
      user: req.userId,
      userId: req.userId,
      donorName: req.user.name,
      images: req.file ? [`${req.file.filename}`] : []
    };

    const donation = new Donation(donationData);
    await donation.save();
    
    console.log('File saved:', req.file);
    console.log('Image path:', req.file ? req.file.filename : 'No image');
    
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
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donation
router.put('/:id', auth, uploadMulter.single('images'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user owns the donation
    if (donation.user.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized to update this donation' });
    }

    const updateData = {
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      quantity: req.body.quantity,
      foodType: req.body.foodType,
      location: JSON.parse(req.body.location),
      availability: JSON.parse(req.body.availability),
      user: req.userId
    };

    if (req.file) {
      if (donation.images && donation.images.length > 0) {
        const oldImagePath = path.join(__dirname, '../uploads/donations', donation.images[0]);
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      updateData.images = [req.file.filename];
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.json(updatedDonation);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ message: error.message });
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

router.post('/create', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const donation = new Donation({
      ...req.body,
      userId: req.userId,
      donorName: user.name // Add donor's name from user
    });
    
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
