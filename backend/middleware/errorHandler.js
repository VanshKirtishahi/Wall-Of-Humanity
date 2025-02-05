const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log error
  console.error({
    message: err.message,
    stack: isProduction ? '🥞' : err.stack,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Email already exists'
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    console.error('MongoDB Error:', err);
    return res.status(500).json({
      message: process.env.NODE_ENV === 'development' 
        ? `Database error: ${err.message}`
        : 'Database error occurred'
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'CORS origin not allowed'
    });
  }

  // Send error response
  res.status(err.status || 500).json({
    message: isProduction ? 'Internal Server Error' : err.message,
    error: isProduction ? {} : err
  });
};

module.exports = errorHandler; 