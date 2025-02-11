const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const fixPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find().select('+password');
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      // Reset password to a known value
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Test123!', salt);
      
      await User.findByIdAndUpdate(
        user._id,
        { $set: { password: hashedPassword } },
        { new: true }
      );
      
      console.log(`Reset password for user: ${user.email}`);
    }
    
    console.log('Password fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Fix error:', error);
    process.exit(1);
  }
};

fixPasswords(); 