const express = require('express');
const path = require('path');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const freeFoodRoutes = require('./routes/freeFoodRoutes');
const fs = require('fs');

const app = express();

// Configure CORS with specific origin
app.use(cors({
  origin: 'https://wall-of-humanity.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static Files
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads/donations');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Create upload directories if they don't exist
const uploadDirs = ['public/uploads/donations', 'public/uploads/free-food'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public')));

// Add after CORS configuration
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/free-food', freeFoodRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;