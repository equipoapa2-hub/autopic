const express = require('express');
const router = express.Router();
const userVehicleUsageController = require('../controllers/userVehicleUsageController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/vehicles/available', userVehicleUsageController.getAvailableVehicles);
router.post('/usage', userVehicleUsageController.createUsage);
router.get('/usage/history', userVehicleUsageController.getUserUsages);
router.get('/usage/active', userVehicleUsageController.getActiveUsage);
router.put('/usage/:id/complete', userVehicleUsageController.completeUsage);

module.exports = router;