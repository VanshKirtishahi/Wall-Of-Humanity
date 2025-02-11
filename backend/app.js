const express = require('express');
const path = require('path');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const freeFoodRoutes = require('./routes/freeFoodRoutes');

const app = express();

// Security Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://wall-of-humanity.vercel.app', 'https://wall-of-humanity-xhoc.onrender.com']
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static Files
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