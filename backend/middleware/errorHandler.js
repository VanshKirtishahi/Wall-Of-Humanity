const errorHandler = (err, req, res, next) => {
  // Log the full error details
  console.error('Error details:', {
    message: err.message,
    name: err.name,
    stack: err.stack,
    code: err.code,
    status: err.status
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(err.errors).map(error => error.message).join(', ')
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Email already exists'
    });
  }

  if (err.name === 'JsonWebTokenError') {
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

  // Default error response
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: process.env.NODE_ENV === 'development' 
      ? err.message
      : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler; 