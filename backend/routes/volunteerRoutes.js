const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const emailService = require('../services/email.service');

// Debug route
router.get('/test', (req, res) => {
  console.log('Volunteer test route hit');
  res.json({ message: 'Volunteer routes are working' });
});

// Submit volunteer application
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    let userId;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // Check if user is already a volunteer
      const existingVolunteer = await Volunteer.findOne({ userId: existingUser._id });
      if (existingVolunteer) {
        return res.status(400).json({
          message: 'You are already registered as a volunteer'
        });
      }
      
      // Update existing user's role to include volunteer
      existingUser.role = existingUser.role === 'user' ? 'volunteer' : `${existingUser.role},volunteer`;
      await existingUser.save();
      userId = existingUser._id;
    } else {
      // Create new user with volunteer role
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: 'defaultPassword',
        role: 'volunteer'
      });
      await user.save();
      userId = user._id;
    }

    // Create volunteer profile
    const volunteer = new Volunteer({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      availability: req.body.availability,
      interests: req.body.interests,
      experience: req.body.experience || '',
      userId: userId
    });

    await volunteer.save();

    res.status(201).json({
      message: 'Volunteer application submitted successfully',
      volunteer
    });
  } catch (error) {
    console.error('Error submitting volunteer application:', error);
    res.status(500).json({ 
      message: 'Error submitting volunteer application',
      error: error.message 
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists'
      });
    }

    // First create a user with volunteer role
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password || 'defaultPassword',
      role: 'volunteer'
    });
    await user.save();

    // Then create the volunteer profile
    const volunteer = new Volunteer({
      ...req.body,
      userId: user._id
    });
    await volunteer.save();
    
    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, req.body.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(201).json({
      message: 'Volunteer registered successfully',
      volunteer,
      user: {
        id: user._id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error registering volunteer:', error);
    res.status(500).json({
      message: 'Error registering volunteer',
      error: error.message
    });
  }
});

module.exports = router; 