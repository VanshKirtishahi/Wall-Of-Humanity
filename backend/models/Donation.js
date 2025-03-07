const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Food', 'Clothes', 'Books', 'Other']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  donorName: {
    type: String,
    default: 'Anonymous'
  },
  quantity: {
    type: String,
    required: true
  },
  foodType: String,
  images: [String],
  availability: {
    startTime: String,
    endTime: String,
    notes: String
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    area: {
      type: String,
      required: false
    }
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'completed', 'requested'],
    default: 'available',
    index: true
  }
}, {
  timestamps: true
});

// Ensure indexes are created
donationSchema.index({ user: 1, status: 1 });

const Donation = mongoose.model('Donation', donationSchema);

// Create indexes
Donation.createIndexes().catch(error => {
  console.error('Error creating indexes:', error);
});

module.exports = Donation; 