const debugLogger = (req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', {
      ...req.body,
      password: req.body.password ? '[REDACTED]' : undefined
    });
  }
  
  // Capture the original send
  const originalSend = res.send;
  res.send = function(data) {
    console.log('Response:', {
      statusCode: res.statusCode,
      body: data
    });
    return originalSend.apply(res, arguments);
  };
  
  next();
};

module.exports = debugLogger; 