const express = require('express');
const router = express.Router();
const adminVehicleUsageController = require('../controllers/adminVehicleUsageController');

router.get('/vehicle-usage', adminVehicleUsageController.getUsages);
router.get('/vehicle-usage/active', adminVehicleUsageController.getActiveUsages);
router.get('/vehicle-usage/:id', adminVehicleUsageController.getUsage);
router.post('/vehicle-usage', adminVehicleUsageController.createUsage);
router.put('/vehicle-usage/:id', adminVehicleUsageController.updateUsage);
router.put('/vehicle-usage/:id/complete', adminVehicleUsageController.completeUsage);
router.delete('/vehicle-usage/:id', adminVehicleUsageController.deleteUsage);

module.exports = router;