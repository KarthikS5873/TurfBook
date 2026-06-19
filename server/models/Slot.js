const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  turf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: true
  },
  date: {
    type: String, // Format YYYY-MM-DD to avoid timezone shifts
    required: true
  },
  startTime: {
    type: String, // Format HH:MM (24-hour, e.g., "06:00")
    required: true
  },
  endTime: {
    type: String, // Format HH:MM (24-hour, e.g., "07:00")
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  }
}, {
  timestamps: true
});

// Avoid overlapping / duplicate slot declarations
SlotSchema.index({ turf: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

module.exports = mongoose.model('Slot', SlotSchema);
