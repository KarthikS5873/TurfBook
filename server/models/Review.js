const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  turf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  photos: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Avoid multiple reviews by the same user on the same turf
ReviewSchema.index({ user: 1, turf: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
