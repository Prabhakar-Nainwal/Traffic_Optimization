const IncomingVehicle = require('../models/IncomingVehicle');
const ParkingZone = require('../models/ParkingZone');

// Get unprocessed incoming vehicles (for real-time display)
exports.getUnprocessed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const vehicles = await IncomingVehicle.findUnprocessed(limit);
    
    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching unprocessed vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unprocessed vehicles',
      error: error.message
    });
  }
};

// Add new incoming vehicle from ANPR
exports.addIncomingVehicle = async (req, res) => {
  try {
    const { numberPlate, vehicleCategory, fuelType, confidence } = req.body;
    
    // Validate required fields
    if (!numberPlate || !vehicleCategory || !fuelType || confidence === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: numberPlate, vehicleCategory, fuelType, confidence'
      });
    }

    // Calculate pollution score
    const pollutionScore = fuelType === 'ICE' ? 80 : 0;

    // IGNORE Commercial vehicles completely
    if (vehicleCategory === 'Commercial') {
      const vehicle = await IncomingVehicle.create({
        numberPlate,
        vehicleCategory,
        fuelType,
        confidence,
        decision: 'Ignore',
        parkingZoneId: null,
        pollutionScore
      });

      // Mark as processed immediately
      await IncomingVehicle.processVehicle(vehicle.id);

      const io = req.app.get('io');
      io.emit('newIncomingVehicle', { ...vehicle, autoProcessed: true });

      return res.status(201).json({
        success: true,
        message: 'Commercial vehicle - Ignored (no parking needed)',
        data: vehicle,
        decision: 'Ignore',
        autoProcessed: true
      });
    }

    // For Private vehicles - check parking occupancy
    const parkingZoneId = 1; // Default to Zone A
    
    const zoneStatus = await ParkingZone.checkOccupancy(parkingZoneId);
    
    if (!zoneStatus) {
      return res.status(404).json({
        success: false,
        message: 'Parking zone not found'
      });
    }

    // Determine decision based on occupancy threshold
    const decision = zoneStatus.decision; // 'Allow' or 'Warn'
    
    // Create incoming vehicle entry
    const vehicle = await IncomingVehicle.create({
      numberPlate,
      vehicleCategory,
      fuelType,
      confidence,
      decision,
      parkingZoneId,
      pollutionScore
    });

    // AUTOMATIC PROCESSING
    const processResult = await IncomingVehicle.processVehicle(vehicle.id);
    
    if (decision === 'Allow' && processResult.vehicleLogId) {
      // Update parking zone occupancy for allowed vehicles
      await ParkingZone.incrementOccupancy(parkingZoneId);
      
      const io = req.app.get('io');
      io.emit('newIncomingVehicle', { ...vehicle, autoProcessed: true });
      io.emit('zoneUpdated', await ParkingZone.findById(parkingZoneId));
      
      return res.status(201).json({
        success: true,
        message: 'Vehicle Allowed - Entry Granted',
        data: vehicle,
        decision: 'Allow',
        zoneInfo: {
          name: zoneStatus.name,
          occupancy: zoneStatus.occupancyPercentage + 1,
          threshold: zoneStatus.thresholdPercentage,
          availableSlots: zoneStatus.availableSlots - 1
        },
        autoProcessed: true,
        vehicleLogId: processResult.vehicleLogId
      });
    } else {
      // Decision is 'Warn' - parking full
      const io = req.app.get('io');
      io.emit('newIncomingVehicle', { ...vehicle, autoProcessed: true });
      
      return res.status(201).json({
        success: true,
        message: 'Vehicle Warned - Parking Full',
        data: vehicle,
        decision: 'Warn',
        zoneInfo: {
          name: zoneStatus.name,
          occupancy: zoneStatus.occupancyPercentage,
          threshold: zoneStatus.thresholdPercentage,
          availableSlots: zoneStatus.availableSlots
        },
        autoProcessed: true
      });
    }
  } catch (error) {
    console.error('Error adding incoming vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding incoming vehicle',
      error: error.message
    });
  }
};

// Process single vehicle
exports.processVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await IncomingVehicle.processVehicle(id);
    
    if (result.success && result.vehicleLogId) {
      // Get the vehicle data
      const vehicle = await IncomingVehicle.findById(id);
      
      // Update parking zone occupancy if allowed
      if (vehicle.parking_zone_id && vehicle.decision === 'Allow') {
        await ParkingZone.incrementOccupancy(vehicle.parking_zone_id);
      }
      
      // Emit real-time updates
      const io = req.app.get('io');
      io.emit('vehicleProcessed', { id, vehicleLogId: result.vehicleLogId });
    }
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Error processing vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing vehicle',
      error: error.message
    });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await IncomingVehicle.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};