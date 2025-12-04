const vehicleService = require('../services/vehicleService');

class AdminVehicleController {
  async getVehicles(req, res) {
    try {
      const { search, status, fuelType } = req.query;
      const filters = {};
      
      if (search) filters.search = search;
      if (status) filters.status = status;
      if (fuelType) filters.fuelType = fuelType;

      const vehicles = await vehicleService.getAllVehicles(filters);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  async getVehicle(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.getVehicleById(id);
      res.json(vehicle);
    } catch (error) {
      res.status(404).json({
        error: error.message
      });
    }
  }

  async createVehicle(req, res) {
    try {
      const vehicleData = req.body;
      const vehicle = await vehicleService.create(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async updateVehicle(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const vehicle = await vehicleService.updateVehicle(id, updateData);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async deleteVehicle(req, res) {
    try {
      const { id } = req.params;
      await vehicleService.deleteVehicle(id);
      res.json({ message: 'Vehículo eliminado correctamente' });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }
}

module.exports = new AdminVehicleController();