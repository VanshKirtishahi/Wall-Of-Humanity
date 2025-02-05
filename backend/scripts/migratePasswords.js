const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const migratePasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find({ 
      $or: [
        { password: { $exists: false } },
        { password: null },
        { password: '' }
      ]
    });
    
    console.log(`Found ${users.length} users needing password migration`);
    
    for (const user of users) {
      const tempPassword = 'ChangeMe123!';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);
      
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log(`Updated password for user: ${user.email}`);
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migratePasswords(); 