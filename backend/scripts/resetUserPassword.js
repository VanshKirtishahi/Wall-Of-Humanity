const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const resetUserPassword = async (email) => {
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
    
    await User.findByIdAndUpdate(
      user._id,
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      },
      { new: true }
    );
    
    console.log('Password reset successful for:', email);
    process.exit(0);
  } catch (error) {
    console.error('Reset error:', error);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

resetUserPassword(email); 