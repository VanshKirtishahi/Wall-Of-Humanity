const helmet = require('helmet');

const securityMiddleware = [
  helmet(),
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.your-domain.com"]
    }
  }),
  helmet.referrerPolicy({ policy: 'same-origin' })
];

module.exports = securityMiddleware; 