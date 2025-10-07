const ParkingZone = require('../models/ParkingZone');

// Get all parking zones
exports.getAllZones = async (req, res) => {
  try {
    const zones = await ParkingZone.findAll();
    
    res.json({
      success: true,
      count: zones.length,
      data: zones
    });
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parking zones',
      error: error.message
    });
  }
};

// Get single parking zone
exports.getZoneById = async (req, res) => {
  try {
    const zone = await ParkingZone.findById(req.params.id);
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Parking zone not found'
      });
    }
    
    res.json({
      success: true,
      data: zone
    });
  } catch (error) {
    console.error('Error fetching zone:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parking zone',
      error: error.message
    });
  }
};

// Create new parking zone
exports.createZone = async (req, res) => {
  try {
    const { name, totalSlots, location } = req.body;
    
    // Validate required fields
    if (!name || !totalSlots) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, totalSlots'
      });
    }
    
    // Check if zone already exists
    const exists = await ParkingZone.exists(name);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'A parking zone with this name already exists'
      });
    }
    
    const zone = await ParkingZone.create({ name, totalSlots, location });
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('zoneCreated', zone);
    
    res.status(201).json({
      success: true,
      message: 'Parking zone created successfully',
      data: zone
    });
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating parking zone',
      error: error.message
    });
  }
};

// Update parking zone
exports.updateZone = async (req, res) => {
  try {
    const { name, totalSlots, location } = req.body;
    
    const zone = await ParkingZone.update(req.params.id, {
      name,
      totalSlots,
      location
    });
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Parking zone not found'
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('zoneUpdated', zone);
    
    res.json({
      success: true,
      message: 'Parking zone updated successfully',
      data: zone
    });
  } catch (error) {
    console.error('Error updating zone:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating parking zone',
      error: error.message
    });
  }
};

// Delete parking zone (soft delete)
exports.deleteZone = async (req, res) => {
  try {
    await ParkingZone.softDelete(req.params.id);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('zoneDeleted', { id: req.params.id });
    
    res.json({
      success: true,
      message: 'Parking zone deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting zone:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting parking zone',
      error: error.message
    });
  }
};