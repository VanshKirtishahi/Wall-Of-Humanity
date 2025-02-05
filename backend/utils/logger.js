const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logToFile = (data) => {
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const logFile = path.join(logDir, 'ngo-registration.log');
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp}: ${JSON.stringify(data, null, 2)}\n`;

  fs.appendFileSync(logFile, logEntry);
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = { logToFile, logger }; 