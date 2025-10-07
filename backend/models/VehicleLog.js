const mongoose = require('mongoose');

const vehicleLogSchema = new mongoose.Schema({
  numberPlate: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'EV', 'CNG'],
    required: true
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: {
    type: Date,
    default: null
  },
  decision: {
    type: String,
    enum: ['Allow', 'Warn', 'Deny'],
    required: true
  },
  parkingZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingZone'
  },
  pollutionScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VehicleLog', vehicleLogSchema);
