const mongoose = require('mongoose');

const DistrictSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the district name'],
    unique: true,
    trim: true
  },
  cities: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('District', DistrictSchema);
