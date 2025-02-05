const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Keep only user-related routes here, remove login/register routes
module.exports = router;
