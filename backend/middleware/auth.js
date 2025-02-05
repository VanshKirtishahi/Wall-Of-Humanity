const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Donation = require('../models/Donation');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'No auth token',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Set both req.user and req.userId for compatibility
    req.user = user;
    req.userId = user._id.toString(); // Ensure consistent ID format
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

module.exports = auth;
