const VehicleLog = require('../models/VehicleLog');
const ParkingZone = require('../models/ParkingZone');

// Get all vehicle logs with filters
exports.getAllVehicles = async (req, res) => {
  try {
    const filters = {
      fuelType: req.query.fuelType,
      decision: req.query.decision,
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

// Get recent vehicle entries (for live feed)
exports.getRecentVehicles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const vehicles = await VehicleLog.findRecent(limit);
    
    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching recent vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent vehicles',
      error: error.message
    });
  }
};

// Add new vehicle entry
exports.addVehicle = async (req, res) => {
  try {
    const { numberPlate, fuelType, decision, parkingZoneId } = req.body;
    
    // Validate required fields
    if (!numberPlate || !fuelType || !decision) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: numberPlate, fuelType, decision'
      });
    }
    
    // Calculate pollution score based on fuel type
    const pollutionScores = {
      'EV': 0,
      'CNG': 20,
      'Petrol': 50,
      'Diesel': 80
    };
    
    const pollutionScore = pollutionScores[fuelType] || 0;
    
    // Create vehicle entry
    const vehicle = await VehicleLog.create({
      numberPlate,
      fuelType,
      decision,
      parkingZoneId,
      pollutionScore
    });
    
    // Update parking zone occupancy if allowed
    if (parkingZoneId && decision === 'Allow') {
      await ParkingZone.incrementOccupancy(parkingZoneId);
    }
    
    // Emit real-time update via WebSocket
    const io = req.app.get('io');
    io.emit('newVehicle', vehicle);
    
    res.status(201).json({
      success: true,
      message: 'Vehicle entry recorded',
      data: vehicle
    });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding vehicle entry',
      error: error.message
    });
  }
};

// Update vehicle exit
exports.updateVehicleExit = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get vehicle details first
    const vehicleBefore = await VehicleLog.findById(id);
    
    if (!vehicleBefore) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // Update exit time
    const vehicle = await VehicleLog.updateExit(id);
    
    // Update parking zone occupancy
    if (vehicleBefore.parking_zone_id) {
      await ParkingZone.decrementOccupancy(vehicleBefore.parking_zone_id);
    }
    
    // Emit real-time update
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
    // Fuel type distribution
    const fuelDistribution = await VehicleLog.getFuelDistribution();
    
    // Daily vehicle count for last 7 days
    const dailyCount = await VehicleLog.getDailyCounts();
    
    // Calculate current pollution index
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