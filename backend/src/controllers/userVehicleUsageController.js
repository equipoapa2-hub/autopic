const vehicleUsageService = require('../services/vehicleUsageService');
const { Vehicle } = require('../models');

class UserVehicleUsageController {
  async getAvailableVehicles(req, res) {
    try {
      const vehicles = await Vehicle.findAll({
        where: { status: 'disponible' },
        attributes: ['id', 'plate', 'brand', 'model', 'color', 'fuelType', 'capacity']
      });

      res.json(vehicles);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  async createUsage(req, res) {
    try {
      const { vehicleId, startMileage, notes } = req.body;
      const userId = req.user.id; // Del middleware de autenticación

      if (!vehicleId || !startMileage) {
        return res.status(400).json({
          error: 'Vehículo y kilometraje inicial son requeridos'
        });
      }

      // Verificar que el vehículo esté disponible
      const vehicle = await Vehicle.findByPk(vehicleId);
      if (!vehicle || vehicle.status !== 'disponible') {
        return res.status(400).json({
          error: 'El vehículo no está disponible'
        });
      }

      const usageData = {
        userId,
        vehicleId,
        startDate: new Date(), // Fecha/hora actual
        startMileage: parseInt(startMileage),
        notes: notes || '',
        status: 'activo'
      };

      const usage = await vehicleUsageService.create(usageData);

      // Actualizar estado del vehículo a "en_uso"
      await vehicle.update({ status: 'en_uso' });

      res.status(201).json(usage);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async getUserUsages(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query; // Agregar soporte para filtro de estado

      const filters = { userId };
      if (status) {
        filters.status = status;
      }

      const usages = await vehicleUsageService.getAllUsages(filters);
      res.json(usages);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  async getActiveUsage(req, res) {
    try {
      const userId = req.user.id;
      const activeUsages = await vehicleUsageService.getAllUsages({
        userId,
        status: 'activo'
      });

      res.json(activeUsages[0] || null); // Devolver el primer uso activo o null
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  async completeUsage(req, res) {
    try {
      const { id } = req.params;
      const { endMileage, notes } = req.body;
      const userId = req.user.id;

      if (!endMileage) {
        return res.status(400).json({
          error: 'El kilometraje final es requerido'
        });
      }

      // Verificar que el uso exista y pertenezca al usuario
      const usage = await vehicleUsageService.getUsageById(id);
      if (!usage) {
        return res.status(404).json({
          error: 'Registro de uso no encontrado'
        });
      }

      if (usage.userId !== userId) {
        return res.status(403).json({
          error: 'No tienes permiso para completar este uso'
        });
      }

      if (usage.status === 'completado') {
        return res.status(400).json({
          error: 'Este uso ya ha sido completado'
        });
      }

      // Completar el uso
      const completedUsage = await vehicleUsageService.completeUsage(
        id,
        parseInt(endMileage),
        notes
      );

      // Actualizar el estado del vehículo a "disponible"
      const vehicle = await Vehicle.findByPk(usage.vehicleId);
      if (vehicle) {
        await vehicle.update({ status: 'disponible' });
      }

      res.json(completedUsage);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }
}

module.exports = new UserVehicleUsageController();