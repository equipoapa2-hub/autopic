const vehicleUsageService = require('../services/vehicleUsageService');

class AdminVehicleUsageController {
  async getUsages(req, res) {
    try {
      const { userId, vehicleId, status, startDate, endDate } = req.query;
      const filters = {};
      
      if (userId) filters.userId = userId;
      if (vehicleId) filters.vehicleId = vehicleId;
      if (status) filters.status = status;
      if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      }

      const usages = await vehicleUsageService.getAllUsages(filters);
      res.json(usages);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  async getUsage(req, res) {
    try {
      const { id } = req.params;
      const usage = await vehicleUsageService.getUsageById(id);
      res.json(usage);
    } catch (error) {
      res.status(404).json({
        error: error.message
      });
    }
  }

  async createUsage(req, res) {
    try {
      const usageData = req.body;
      const usage = await vehicleUsageService.create(usageData);
      res.status(201).json(usage);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async updateUsage(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const usage = await vehicleUsageService.updateUsage(id, updateData);
      res.json(usage);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async completeUsage(req, res) {
    try {
      const { id } = req.params;
      const { endMileage, notes } = req.body;
      const usage = await vehicleUsageService.completeUsage(id, endMileage, notes);
      res.json(usage);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async deleteUsage(req, res) {
    try {
      const { id } = req.params;
      await vehicleUsageService.deleteUsage(id);
      res.json({ message: 'Registro de uso eliminado correctamente' });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async getActiveUsages(req, res) {
    try {
      const usages = await vehicleUsageService.getActiveUsages();
      res.json(usages);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
}

module.exports = new AdminVehicleUsageController();