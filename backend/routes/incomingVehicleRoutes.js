const express = require('express');
const router = express.Router();
const incomingVehicleController = require('../controllers/incomingVehicleController');

// Get unprocessed incoming vehicles
router.get('/unprocessed', incomingVehicleController.getUnprocessed);

// Get statistics
router.get('/stats', incomingVehicleController.getStats);

// Add new incoming vehicle (ANPR endpoint)
router.post('/', incomingVehicleController.addIncomingVehicle);

// Process single vehicle
router.post('/:id/process', incomingVehicleController.processVehicle);

module.exports = router;