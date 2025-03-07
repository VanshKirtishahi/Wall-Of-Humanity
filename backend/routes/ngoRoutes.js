const express = require('express');
const router = express.Router();
const NGO = require('../models/NGO');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../config/multer');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// Get all NGOs
router.get('/', async (req, res) => {
  try {
    const ngos = await NGO.find()
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      ngos
    });
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    res.status(500).json({
      message: 'Error fetching NGOs',
      error: error.message
    });
  }
});

// Submit NGO registration
router.post('/register', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'certification', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received form data:', req.body);

    // Validate required fields
    const requiredFields = ['organizationName', 'organizationEmail', 'phoneNumber', 'ngoType', 'address'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    let logoUrl, certificationUrl;

    // Upload logo to Cloudinary
    if (req.files?.logo?.[0]) {
      try {
        logoUrl = await uploadToCloudinary(
          req.files.logo[0].buffer,
          req.files.logo[0].mimetype,
          'ngo-logos'
        );
      } catch (error) {
        console.error('Error uploading logo:', error);
        return res.status(400).json({ message: 'Failed to upload logo' });
      }
    }

    // Upload certification to Cloudinary
    if (req.files?.certification?.[0]) {
      try {
        certificationUrl = await uploadToCloudinary(
          req.files.certification[0].buffer,
          req.files.certification[0].mimetype,
          'ngo-certificates'
        );
      } catch (error) {
        console.error('Error uploading certification:', error);
        return res.status(400).json({ message: 'Failed to upload certification' });
      }
    }

    const ngo = new NGO({
      organizationName: req.body.organizationName,
      organizationEmail: req.body.organizationEmail,
      phoneNumber: req.body.phoneNumber,
      contactPersonName: req.body.contactPersonName,
      contactPersonEmail: req.body.contactPersonEmail,
      contactPersonPhone: req.body.contactPersonPhone,
      ngoType: req.body.ngoType,
      incorporationDate: req.body.incorporationDate,
      address: req.body.address,
      ngoWebsite: req.body.ngoWebsite,
      socialMediaLinks: req.body.socialMediaLinks,
      logo: logoUrl,
      certification: certificationUrl,
      status: 'pending'
    });

    await ngo.save();

    res.status(201).json({
      message: 'NGO registration submitted successfully',
      ngo: ngo
    });
  } catch (error) {
    console.error('NGO registration error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'An NGO with this email already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Add NGO profile route
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user?.ngoId) {
      return res.status(404).json({ message: 'NGO profile not found' });
    }

    const ngo = await NGO.findById(user.ngoId);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO profile not found' });
    }

    res.json({ ngo });
  } catch (error) {
    console.error('Error fetching NGO profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this route for debugging
router.get('/debug-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const ngo = user?.ngoId ? await NGO.findById(user.ngoId) : null;
    
    res.json({
      user: {
        id: user._id,
        role: user.role,
        ngoId: user.ngoId
      },
      ngo: ngo
    });
  } catch (error) {
    res.status(500).json({ message: 'Debug route error', error: error.message });
  }
});

module.exports = router; 