const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  interests: {
    type: String,
    required: true
  },
  experience: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Volunteer', volunteerSchema); 