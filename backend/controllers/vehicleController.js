const VehicleLog = require('../models/VehicleLog');
const ParkingZone = require('../models/ParkingZone');

// Get all vehicle logs with filters
exports.getAllVehicles = async (req, res) => {
  try {
    const filters = {
      fuelType: req.query.fuelType,
      vehicleCategory: req.query.vehicleCategory,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      limit: req.query.limit
    };
    
    const vehicles = await VehicleLog.findAll(filters);
    
    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle logs',
      error: error.message
    });
  }
};

// Update vehicle exit
exports.updateVehicleExit = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehicleBefore = await VehicleLog.findById(id);
    
    if (!vehicleBefore) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    const vehicle = await VehicleLog.updateExit(id);
    
    // Update parking zone occupancy
    if (vehicleBefore.parking_zone_id) {
      await ParkingZone.decrementOccupancy(vehicleBefore.parking_zone_id);
    }
    
    const io = req.app.get('io');
    io.emit('vehicleExit', vehicle);
    
    res.json({
      success: true,
      message: 'Vehicle exit recorded',
      data: vehicle
    });
  } catch (error) {
    console.error('Error updating vehicle exit:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle exit',
      error: error.message
    });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const fuelDistribution = await VehicleLog.getFuelDistribution();
    const dailyCount = await VehicleLog.getDailyCounts();
    const pollutionIndex = await VehicleLog.getPollutionIndex();
    
    res.json({
      success: true,
      data: {
        fuelDistribution,
        dailyCount,
        pollutionIndex
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

