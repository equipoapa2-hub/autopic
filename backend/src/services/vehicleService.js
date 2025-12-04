const { Vehicle } = require('../models');
const { Op } = require('sequelize');

class VehicleService {
    async create(vehicleData) {
        try {
            const vehicle = await Vehicle.create(vehicleData);
            return this._sanitizeVehicle(vehicle);
        } catch (error) {
            throw new Error(`Error al crear vehículo: ${error.message}`);
        }
    }

    async getAllVehicles(filters = {}) {
        try {
            const whereClause = {};

            if (filters.search) {
                whereClause[Op.or] = [
                    { plate: { [Op.iLike]: `%${filters.search}%` } },
                    { brand: { [Op.iLike]: `%${filters.search}%` } },
                    { model: { [Op.iLike]: `%${filters.search}%` } }
                ];
            }

            if (filters.status) {
                whereClause.status = filters.status;
            }

            if (filters.fuelType) {
                whereClause.fuelType = filters.fuelType;
            }

            const vehicles = await Vehicle.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']]
            });

            return vehicles.map(vehicle => this._sanitizeVehicle(vehicle));
        } catch (error) {
            throw new Error(`Error al obtener vehículos: ${error.message}`);
        }
    }

    async getVehicleById(vehicleId) {
        try {
            const vehicle = await Vehicle.findByPk(vehicleId);
            if (!vehicle) {
                throw new Error('Vehículo no encontrado');
            }
            return this._sanitizeVehicle(vehicle);
        } catch (error) {
            throw new Error(`Error al obtener vehículo: ${error.message}`);
        }
    }

    async updateVehicle(vehicleId, updateData) {
        try {
            const vehicle = await Vehicle.findByPk(vehicleId);
            if (!vehicle) {
                throw new Error('Vehículo no encontrado');
            }

            await vehicle.update(updateData);
            return this._sanitizeVehicle(vehicle);
        } catch (error) {
            throw new Error(`Error al actualizar vehículo: ${error.message}`);
        }
    }

    async deleteVehicle(vehicleId) {
        try {
            const vehicle = await Vehicle.findByPk(vehicleId);
            if (!vehicle) {
                throw new Error('Vehículo no encontrado');
            }

            await vehicle.destroy();
        } catch (error) {
            throw new Error(`Error al eliminar vehículo: ${error.message}`);
        }
    }

    _sanitizeVehicle(vehicle) {
        return {
            id: vehicle.id,
            plate: vehicle.plate,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            status: vehicle.status,
            fuelType: vehicle.fuelType,
            capacity: vehicle.capacity,
            createdAt: vehicle.createdAt,
            updatedAt: vehicle.updatedAt
        };
    }
}

module.exports = new VehicleService();