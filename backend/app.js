const express = require('express');
const path = require('path');
const cors = require('cors');
const emailRoutes = require('./routes/emailRoutes');
const freeFoodRoutes = require('./routes/freeFoodRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.vercel.app'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/email', emailRoutes);
app.use('/api/free-food', freeFoodRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;