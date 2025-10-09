const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

router.get('/', vehicleController.getAllVehicles);
router.get('/analytics', vehicleController.getAnalytics);
router.put('/:id/exit', vehicleController.updateVehicleExit);

module.exports = router;