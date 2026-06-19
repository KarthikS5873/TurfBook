const mongoose = require('mongoose');

const TurfSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the turf name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide the turf description']
  },
  images: {
    type: [String],
    default: []
  },
  district: {
    type: String,
    required: [true, 'Please provide the district name (e.g., Chennai, Coimbatore)'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Please provide the city or town'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please provide the complete address']
  },
  coordinates: {
    lat: {
      type: Number,
      required: false
    },
    lng: {
      type: Number,
      required: false
    }
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Please provide the price per hour']
  },
  amenities: {
    type: [String],
    default: []
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Turf', TurfSchema);
