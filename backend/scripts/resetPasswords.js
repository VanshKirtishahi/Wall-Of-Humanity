const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetPassword = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Test123!', salt);

    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    console.log('Password reset successful');
    process.exit(0);
  } catch (error) {
    console.error('Reset error:', error);
    process.exit(1);
  }
};

// Usage: node resetPassword.js vanshkirtishahi@gmail.com
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

resetPassword(email); 