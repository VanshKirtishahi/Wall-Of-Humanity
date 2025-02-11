const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const verifyAndFixPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find().select('+password');
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      if (!user.password || user.password.length < 20) {
        const defaultPassword = 'ChangeMe123!';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);
        
        await User.findByIdAndUpdate(
          user._id,
          { $set: { password: hashedPassword } }
        );
        
        console.log(`Fixed password for user: ${user.email}`);
      }
    }
    
    console.log('Password verification completed');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Script error:', error);
    process.exit(1);
  }
};

verifyAndFixPasswords(); 