require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const requestRoutes = require('./routes/requestRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const userRoutes = require('./routes/userRoutes');
const debugLogger = require('./middleware/debugLogger');
const emailRoutes = require('./routes/emailRoutes');
const freeFoodRoutes = require('./routes/freeFoodRoutes');

const app = express();

// Connect to database
mongoose.connection.once('open', () => {
  console.log('MongoDB Connected:', mongoose.connection.host);
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://wall-of-humanity.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Create upload directories if they don't exist
const uploadDirs = ['uploads', 'uploads/donations', 'uploads/ngo-logos', 'uploads/ngo-certificates'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/donations');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg, .jpeg and .pdf formats allowed!'));
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, 'uploads')));

const freeFoodUploadsDir = path.join(__dirname, 'uploads', 'free-food');
if (!fs.existsSync(freeFoodUploadsDir)){
    fs.mkdirSync(freeFoodUploadsDir, { recursive: true });
}

// Move debug logger before routes
if (process.env.NODE_ENV === 'development') {
  app.use(debugLogger);
}

// Then mount routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/free-food', freeFoodRoutes);

// Add this after your other middleware
app.use('/uploads', express.static('uploads'));

// Error handling middleware should be last
app.use(errorHandler);

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't exit immediately, give time for cleanup
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('ERROR: JWT_SECRET not set in environment variables');
      process.exit(1);
    }
    
    await connectDB();
    
    const tryPort = async (port) => {
      try {
        const server = await new Promise((resolve, reject) => {
          const srv = app.listen(port, () => resolve(srv))
            .on('error', (err) => {
              if (err.code === 'EADDRINUSE') {
                resolve(false);
              } else {
                reject(err);
              }
            });
        });
        return server;
      } catch (error) {
        return false;
      }
    };

    let port = parseInt(process.env.PORT) || 5000;
    let server = await tryPort(port);
    
    while (!server && port < 5010) {
      port++;
      server = await tryPort(port);
    }

    if (!server) {
      throw new Error('Could not find an available port');
    }

    console.log(`Server running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      await new Promise(resolve => server.close(resolve));
      await mongoose.connection.close();
      console.log('Server and MongoDB connection closed');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();