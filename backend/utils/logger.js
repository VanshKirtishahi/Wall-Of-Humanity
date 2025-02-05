const fs = require('fs');
const path = require('path');

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

module.exports = { logToFile }; 