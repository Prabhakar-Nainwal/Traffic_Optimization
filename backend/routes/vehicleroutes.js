const express = require('express');
const router = express.Router();

const vehicleController = require('../controllers/vehicleController'); //Traffic Analysis

router.get('/', vehicleController.getAllVehicles);
router.get('/analytics', vehicleController.getAnalytics);
router.put('/:id/exit', vehicleController.updateVehicleExit);
router.get('/analytics/traffic', vehicleController.getTrafficAnalytics);  //Traffic Analysis

module.exports = router;


