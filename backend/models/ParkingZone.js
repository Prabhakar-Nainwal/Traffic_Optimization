const mongoose = require('mongoose');

const parkingZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  totalSlots: {
    type: Number,
    required: true,
    min: 1
  },
  occupiedSlots: {
    type: Number,
    default: 0,
    min: 0
  },
  location: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual field for available slots
parkingZoneSchema.virtual('availableSlots').get(function() {
  return this.totalSlots - this.occupiedSlots;
});

// Virtual field for occupancy percentage
parkingZoneSchema.virtual('occupancyPercentage').get(function() {
  return Math.round((this.occupiedSlots / this.totalSlots) * 100);
});

parkingZoneSchema.set('toJSON', { virtuals: true });
parkingZoneSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ParkingZone', parkingZoneSchema);
