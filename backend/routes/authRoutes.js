const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');
const Donation = require('../models/Donation');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const emailService = require('../services/email.service');
const upload = require('../config/multer');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadMulter = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Test route to verify auth routes are working
router.get('/', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

// Register route with validation
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already registered'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't return error here, just log it
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user',
      details: error.message 
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ 
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password'); // Explicitly include password field

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      console.error('User found but password is undefined:', user._id);
      return res.status(500).json({ 
        message: 'Please reset your password or contact support'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send complete response
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get profile route
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure avatarUrl is included in response
    const userResponse = {
      ...user.toObject(),
      avatarUrl: user.avatarUrl || null
    };

    console.log('Fetching profile with avatar:', userResponse.avatarUrl);
    res.json(userResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get basic user data
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('_id name email createdAt updatedAt');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in user route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token route
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }  // Longer expiration
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        phone: user.phone,
        address: user.address,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({ message: 'Token verification failed' });
  }
});

// Update profile route
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Updating profile with data:', req.body);

    // Update basic fields if provided
    const updateFields = ['name', 'email', 'bio', 'phone', 'address', 'avatarUrl'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Save the updated user
    const updatedUser = await user.save();
    
    // Remove sensitive data and ensure avatarUrl is included
    const userResponse = {
      ...updatedUser.toObject(),
      avatarUrl: updatedUser.avatarUrl || null
    };
    delete userResponse.password;
    
    console.log('Updated user:', {
      id: userResponse._id,
      name: userResponse.name,
      avatarUrl: userResponse.avatarUrl
    });

    res.json(userResponse);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile',
      error: error.message 
    });
  }
});

// Delete profile route
router.delete('/profile/delete', auth, async (req, res) => {
  try {
    // Find and delete the user
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete any associated data (like donations, etc.)
    await Promise.all([
      // Add other model deletions here if needed
      Donation.deleteMany({ userId: req.userId }),
      // Example: Comment.deleteMany({ userId: req.userId })
    ]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

// Upload avatar to Cloudinary
router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Uploading file to Cloudinary...');
    // Upload to Cloudinary
    const avatarUrl = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      'avatars'
    );

    if (!avatarUrl) {
      throw new Error('Failed to upload to Cloudinary');
    }

    // Update user's avatarUrl
    const user = await User.findById(req.user._id);
    if (user) {
      user.avatarUrl = avatarUrl;
      await user.save();
    }

    console.log('Successfully uploaded to Cloudinary:', avatarUrl);
    res.json({ avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload avatar',
      error: error.message 
    });
  }
});

// Change password route
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Please provide both current and new password'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// Log registered routes
console.log('\nAuth Routes:');
router.stack.forEach(r => {
  if (r.route) {
    console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
  }
});

module.exports = router;