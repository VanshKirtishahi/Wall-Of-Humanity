const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: [true, 'Organization name is required']
  },
  organizationEmail: {
    type: String,
    required: [true, 'Organization email is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  phoneNumber: {
    type: String,
    required: true
  },
  contactPersonName: String,
  contactPersonEmail: String,
  contactPersonPhone: String,
  ngoWebsite: String,
  ngoType: {
    type: String,
    required: true
  },
  incorporationDate: Date,
  address: {
    type: String,
    required: true
  },
  socialMediaLinks: String,
  logo: String,
  certification: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NGO', ngoSchema); 