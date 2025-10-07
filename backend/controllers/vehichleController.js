const VehicleLog = require('../models/VehicleLog');
const ParkingZone = require('../models/ParkingZone');

// Get all vehicle logs with filters
exports.getAllVehicles = async (req, res) => {
  try {
    const { fuelType, decision, startDate, endDate, search } = req.query;
    
    let query = {};
    
    if (fuelType) query.fuelType = fuelType;
    if (decision) query.decision = decision;
    if (search) query.numberPlate = { $regex: search, $options: 'i' };
    
    if (startDate || endDate) {
      query.entryTime = {};
      if (startDate) query.entryTime.$gte = new Date(startDate);
      if (endDate) query.entryTime.$lte = new Date(endDate);
    }
    
    const vehicles = await VehicleLog.find(query)
      .populate('parkingZone', 'name')
      .sort({ entryTime: -1 });
    
    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
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
    
    const vehicles = await VehicleLog.find()
      .sort({ entryTime: -1 })
      .limit(limit)
      .populate('parkingZone', 'name');
    
    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
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
    const { numberPlate, fuelType, decision, parkingZone } = req.body;
    
    // Calculate pollution score based on fuel type
    const pollutionScores = {
      'EV': 0,
      'CNG': 20,
      'Petrol': 50,
      'Diesel': 80
    };
    
    const pollutionScore = pollutionScores[fuelType] || 0;
    
    const vehicle = await VehicleLog.create({
      numberPlate,
      fuelType,
      decision,
      parkingZone,
      pollutionScore
    });
    
    // Update parking zone occupancy
    if (parkingZone && decision === 'Allow') {
      await ParkingZone.findByIdAndUpdate(
        parkingZone,
        { $inc: { occupiedSlots: 1 } }
      );
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
    
    const vehicle = await VehicleLog.findByIdAndUpdate(
      id,
      { exitTime: new Date() },
      { new: true }
    );
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // Update parking zone occupancy
    if (vehicle.parkingZone) {
      await ParkingZone.findByIdAndUpdate(
        vehicle.parkingZone,
        { $inc: { occupiedSlots: -1 } }
      );
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
    const fuelDistribution = await VehicleLog.aggregate([
      {
        $group: {
          _id: '$fuelType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Daily vehicle count for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyCount = await VehicleLog.aggregate([
      {
        $match: {
          entryTime: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$entryTime' }
          },
          count: { $sum: 1 },
          avgPollution: { $avg: '$pollutionScore' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Calculate current pollution index
    const recentVehicles = await VehicleLog.find({
      entryTime: { $gte: new Date(Date.now() - 3600000) } // Last hour
    });
    
    const pollutionIndex = recentVehicles.length > 0
      ? Math.round(recentVehicles.reduce((sum, v) => sum + v.pollutionScore, 0) / recentVehicles.length)
      : 0;
    
    res.json({
      success: true,
      data: {
        fuelDistribution,
        dailyCount,
        pollutionIndex
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};