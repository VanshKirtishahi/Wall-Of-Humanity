const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const jwtSecret = process.env.JWT_SECRET;

    // Log environment status
    console.log('Environment check:', {
      mongoUri: mongoUri ? 'Set' : 'Not set',
      jwtSecret: jwtSecret ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV || 'development'
    });

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    if (!jwtSecret) {
      console.warn('WARNING: JWT_SECRET not set, using fallback secret');
    }

    const conn = await mongoose.connect(mongoUri, {
      // Remove deprecated options
      // useNewUrlParser and useUnifiedTopology are no longer needed
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    throw error; // Let the server handle the error
  }
};

module.exports = connectDB;