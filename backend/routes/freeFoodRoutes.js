const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const FreeFoodListing = require('../models/FreeFoodListing');
const fs = require('fs').promises;
const { deleteUploadedImage } = require('../utils/fileUtils');

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/free-food'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'venue-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Create new listing with image upload
router.post('/', auth, upload.single('venueImage'), handleMulterError, async (req, res) => {
  try {
    const listingData = {
      ...req.body,
      uploadedBy: req.user._id
    };

    // Parse JSON strings back to objects
    if (req.body.availability) {
      listingData.availability = JSON.parse(req.body.availability);
    }
    if (req.body.location) {
      listingData.location = JSON.parse(req.body.location);
    }

    // Add image path if image was uploaded
    if (req.file) {
      listingData.venueImage = req.file.filename;
      console.log('Saved image filename:', req.file.filename);
      console.log('Full image path:', path.join('uploads/free-food', req.file.filename));
    }

    const listing = new FreeFoodListing(listingData);
    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating free food listing:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all listings
router.get('/', async (req, res) => {
  try {
    const listings = await FreeFoodListing.find()
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(listings);
  } catch (error) {
    console.error('Error fetching free food listings:', error);
    res.status(500).json({ message: 'Error fetching listings' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await FreeFoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update listing
router.put('/:id', auth, upload.single('venueImage'), handleMulterError, async (req, res) => {
  try {
    const listing = await FreeFoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const listingData = { ...req.body };
    
    // Parse JSON fields
    if (req.body.availability) {
      listingData.availability = JSON.parse(req.body.availability);
    }
    if (req.body.location) {
      listingData.location = JSON.parse(req.body.location);
    }
    
    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (listing.venueImage) {
        await deleteUploadedImage(listing.venueImage, 'free-food');
      }
      listingData.venueImage = req.file.filename;
    }

    const updatedListing = await FreeFoodListing.findByIdAndUpdate(
      req.params.id,
      listingData,
      { new: true, runValidators: true }
    );

    res.json(updatedListing);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete listing
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await FreeFoodListing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    // Delete image if exists
    if (listing.venueImage) {
      await deleteUploadedImage(listing.venueImage, 'free-food');
    }

    await FreeFoodListing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting listing' });
  }
});

// Get user's listings
router.get('/my-listings', auth, async (req, res) => {
  try {
    const listings = await FreeFoodListing.find({ uploadedBy: req.user._id });
    res.json(listings);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ message: 'Error fetching listings' });
  }
});

module.exports = router; 