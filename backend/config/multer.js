const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create base uploads directory
const baseUploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Create donations directory
const donationsDir = path.join(baseUploadDir, 'donations');
if (!fs.existsSync(donationsDir)) {
  fs.mkdirSync(donationsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, donationsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

module.exports = upload; 