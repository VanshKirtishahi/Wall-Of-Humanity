const express = require('express');
const router = express.Router();

// Import route files
const donationRoutes = require('./donationRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const requestRoutes = require('./requestRoutes');
const volunteerRoutes = require('./volunteerRoutes');
const ngoRoutes = require('./ngoRoutes');

// Mount routes
router.use('/donations', donationRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/requests', requestRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/ngos', ngoRoutes);

// Debug route
router.get('/test', (req, res) => {
  res.json({ message: 'API routes are working' });
});

// Log all registered routes
console.log('Registered API routes:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
  } else if (r.name === 'router') {
    console.log(`Mounted ${r.regexp}`);
  }
});

module.exports = router; 