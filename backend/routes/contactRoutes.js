const express = require('express');
const router = express.Router();
const emailService = require('../services/email.service');

// Debug log to check if emailService is properly imported
console.log('Email service loaded:', typeof emailService.sendContactEmail === 'function');

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email and message' 
      });
    }

    console.log('Attempting to send email with:', { name, email });

    // Send email using the email service instance
    await emailService.sendContactEmail(name, email, message);

    console.log('Email sent successfully');
    res.json({ 
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send message',
      error: error.message 
    });
  }
});

module.exports = router; 