const express = require('express');
const router = express.Router();
const incomingVehicleController = require('../controllers/incomingVehicleController');

// Get all incoming vehicles
router.get('/', incomingVehicleController.getIncomingVehicles);

// Get unprocessed incoming vehicles only
router.get('/unprocessed', incomingVehicleController.getUnprocessed);

// Get statistics
router.get('/stats', incomingVehicleController.getStats);

// Add new incoming vehicle (ANPR endpoint)
router.post('/', incomingVehicleController.addIncomingVehicle);

// Process single vehicle (move to permanent logs)
router.post('/:id/process', incomingVehicleController.processVehicle);

// Batch process multiple vehicles
router.post('/process-batch', incomingVehicleController.processBatch);

// Auto-process old vehicles
router.post('/auto-process', incomingVehicleController.autoProcess);

// Cleanup old processed entries
router.delete('/cleanup', incomingVehicleController.cleanup);

module.exports = router;