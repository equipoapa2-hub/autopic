const express = require('express');
const router = express.Router();
const adminVehicleController = require('../controllers/adminVehicleController');

router.get('/vehicles', adminVehicleController.getVehicles);
router.get('/vehicles/:id', adminVehicleController.getVehicle);
router.post('/vehicles', adminVehicleController.createVehicle);
router.put('/vehicles/:id', adminVehicleController.updateVehicle);
router.delete('/vehicles/:id', adminVehicleController.deleteVehicle);

module.exports = router;