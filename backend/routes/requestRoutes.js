const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const auth = require('../middleware/auth');
const Donation = require('../models/Donation');
const emailService = require('../services/email.service');
const User = require('../models/User');

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
    const donationDoc = await Donation.findById(donation).populate('user');
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

    // Get requester details
    const requester = await User.findById(req.userId);

    // Send email to donation owner
    try {
      const emailHtml = `
        <h2>New Donation Request</h2>
        <p>Hello ${donationDoc.user.name},</p>
        <p>You have received a new request for your donation:</p>
        <p><strong>Item:</strong> ${donationDoc.title}</p>
        <p><strong>Requested by:</strong> ${requestorName}</p>
        <p><strong>Contact Number:</strong> ${contactNumber}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Urgency:</strong> ${urgency || 'normal'}</p>
        <p>Please review the request and take appropriate action.</p>
        <br>
        <p>Best regards,</p>
        <p>Wall of Humanity Team</p>
      `;

      await emailService.transporter.sendMail({
        from: `"Wall of Humanity" <${process.env.EMAIL_USER}>`,
        to: donationDoc.user.email,
        subject: 'New Donation Request Received',
        html: emailHtml
      });

      // Send confirmation email to requester
      const requesterEmailHtml = `
        <h2>Donation Request Confirmation</h2>
        <p>Hello ${requestorName},</p>
        <p>Your request for the following donation has been submitted successfully:</p>
        <p><strong>Item:</strong> ${donationDoc.title}</p>
        <p><strong>Your Request Details:</strong></p>
        <ul>
          <li>Contact Number: ${contactNumber}</li>
          <li>Address: ${address}</li>
          <li>Reason: ${reason}</li>
          <li>Urgency: ${urgency || 'normal'}</li>
        </ul>
        <p>The donor will be notified and will review your request.</p>
        <p>We will notify you once they take action on your request.</p>
        <br>
        <p>Best regards,</p>
        <p>Wall of Humanity Team</p>
      `;

      await emailService.transporter.sendMail({
        from: `"Wall of Humanity" <${process.env.EMAIL_USER}>`,
        to: requester.email,
        subject: 'Donation Request Confirmation',
        html: requesterEmailHtml
      });

    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't return error here, just log it
    }

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

    const oldStatus = request.status;
    request.status = req.body.status;
    const updatedRequest = await request.save();
    
    await updatedRequest.populate('user', 'name email');
    await updatedRequest.populate('donation');

    // Send email notification about status update
    try {
      const statusEmailHtml = `
        <h2>Donation Request Status Update</h2>
        <p>Hello ${updatedRequest.requestorName},</p>
        <p>The status of your donation request has been updated:</p>
        <p><strong>Item:</strong> ${updatedRequest.donation.title}</p>
        <p><strong>Previous Status:</strong> ${oldStatus}</p>
        <p><strong>New Status:</strong> ${updatedRequest.status}</p>
        ${updatedRequest.status === 'approved' ? `
        <p>Your request has been approved! The donor will contact you soon with further details.</p>
        ` : updatedRequest.status === 'rejected' ? `
        <p>Unfortunately, your request has been rejected. You can try requesting other available donations.</p>
        ` : ''}
        <br>
        <p>Best regards,</p>
        <p>Wall of Humanity Team</p>
      `;

      await emailService.transporter.sendMail({
        from: `"Wall of Humanity" <${process.env.EMAIL_USER}>`,
        to: updatedRequest.user.email,
        subject: `Donation Request ${updatedRequest.status.charAt(0).toUpperCase() + updatedRequest.status.slice(1)}`,
        html: statusEmailHtml
      });
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't return error here, just log it
    }
    
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