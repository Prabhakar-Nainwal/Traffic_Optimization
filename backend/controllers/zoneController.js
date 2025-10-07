const ParkingZone = require('../models/ParkingZone');

// Get all parking zones
exports.getAllZones = async (req, res) => {
  try {
    const zones = await ParkingZone.find({ isActive: true });
    
    res.json({
      success: true,
      count: zones.length,
      data: zones
    });
  } catch (error) {
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
    
    const zone = await ParkingZone.create({
      name,
      totalSlots,
      location
    });
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('zoneCreated', zone);
    
    res.status(201).json({
      success: true,
      message: 'Parking zone created successfully',
      data: zone
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A parking zone with this name already exists'
      });
    }
    
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
    
    const zone = await ParkingZone.findByIdAndUpdate(
      req.params.id,
      { name, totalSlots, location },
      { new: true, runValidators: true }
    );
    
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
    const zone = await ParkingZone.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Parking zone not found'
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('zoneDeleted', { id: req.params.id });
    
    res.json({
      success: true,
      message: 'Parking zone deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting parking zone',
      error: error.message
    });
  }
};