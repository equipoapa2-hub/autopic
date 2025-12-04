const { VehicleUsage, User, Vehicle } = require('../models');
const { Op } = require('sequelize');

class VehicleUsageService {
    async create(usageData) {
        try {
            const usage = await VehicleUsage.create(usageData);
            return await this._getUsageWithDetails(usage.id);
        } catch (error) {
            throw new Error(`Error al crear registro de uso: ${error.message}`);
        }
    }

    async getAllUsages(filters = {}) {
        try {
            const whereClause = {};

            if (filters.userId) {
                whereClause.userId = filters.userId;
            }

            if (filters.vehicleId) {
                whereClause.vehicleId = filters.vehicleId;
            }

            if (filters.status) {
                whereClause.status = filters.status; // Esto es lo importante
            }

            if (filters.startDate && filters.endDate) {
                whereClause.startDate = {
                    [Op.between]: [filters.startDate, filters.endDate]
                };
            }

            const usages = await VehicleUsage.findAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'User',
                        attributes: ['id', 'name', 'lastName1', 'lastName2', 'email']
                    },
                    {
                        model: Vehicle,
                        as: 'Vehicle',
                        attributes: ['id', 'plate', 'brand', 'model', 'color']
                    }
                ],
                order: [['startDate', 'DESC']]
            });

            return usages.map(usage => this._sanitizeUsage(usage));
        } catch (error) {
            throw new Error(`Error al obtener registros de uso: ${error.message}`);
        }
    }

    async getUsageById(usageId) {
        try {
            const usage = await VehicleUsage.findByPk(usageId, {
                include: [
                    {
                        model: User,
                        as: 'User',
                        attributes: ['id', 'name', 'lastName1', 'lastName2', 'email']
                    },
                    {
                        model: Vehicle,
                        as: 'Vehicle',
                        attributes: ['id', 'plate', 'brand', 'model', 'color']
                    }
                ]
            });

            if (!usage) {
                throw new Error('Registro de uso no encontrado');
            }

            return this._sanitizeUsage(usage);
        } catch (error) {
            throw new Error(`Error al obtener registro de uso: ${error.message}`);
        }
    }

    async updateUsage(usageId, updateData) {
        try {
            const usage = await VehicleUsage.findByPk(usageId);
            if (!usage) {
                throw new Error('Registro de uso no encontrado');
            }

            await usage.update(updateData);
            return await this._getUsageWithDetails(usageId);
        } catch (error) {
            throw new Error(`Error al actualizar registro de uso: ${error.message}`);
        }
    }

    async completeUsage(usageId, endMileage, notes = null) {
        try {
            const usage = await VehicleUsage.findByPk(usageId);
            if (!usage) {
                throw new Error('Registro de uso no encontrado');
            }

            const updateData = {
                endDate: new Date(),
                endMileage: endMileage,
                status: 'completado'
            };

            if (notes !== null) {
                updateData.notes = notes;
            }

            await usage.update(updateData);
            return await this._getUsageWithDetails(usageId);
        } catch (error) {
            throw new Error(`Error al completar registro de uso: ${error.message}`);
        }
    }

    async deleteUsage(usageId) {
        try {
            const usage = await VehicleUsage.findByPk(usageId);
            if (!usage) {
                throw new Error('Registro de uso no encontrado');
            }

            await usage.destroy();
        } catch (error) {
            throw new Error(`Error al eliminar registro de uso: ${error.message}`);
        }
    }

    async getActiveUsages() {
        try {
            const usages = await VehicleUsage.findAll({
                where: { status: 'activo' },
                include: [
                    {
                        model: User,
                        as: 'User',
                        attributes: ['id', 'name', 'lastName1', 'lastName2', 'email']
                    },
                    {
                        model: Vehicle,
                        as: 'Vehicle',
                        attributes: ['id', 'plate', 'brand', 'model', 'color']
                    }
                ],
                order: [['startDate', 'DESC']]
            });

            return usages.map(usage => this._sanitizeUsage(usage));
        } catch (error) {
            throw new Error(`Error al obtener usos activos: ${error.message}`);
        }
    }

    async _getUsageWithDetails(usageId) {
        const usage = await VehicleUsage.findByPk(usageId, {
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'name', 'lastName1', 'lastName2', 'email']
                },
                {
                    model: Vehicle,
                    as: 'Vehicle',
                    attributes: ['id', 'plate', 'brand', 'model', 'color']
                }
            ]
        });

        return this._sanitizeUsage(usage);
    }

    async createUserUsage(usageData) {
        try {
            const usage = await VehicleUsage.create(usageData);
            return await this._getUsageWithDetails(usage.id);
        } catch (error) {
            throw new Error(`Error al crear registro de uso: ${error.message}`);
        }
    }

    _sanitizeUsage(usage) {
        return {
            id: usage.id,
            userId: usage.userId,
            vehicleId: usage.vehicleId,
            startDate: usage.startDate,
            endDate: usage.endDate,
            status: usage.status,
            startMileage: usage.startMileage,
            endMileage: usage.endMileage,
            notes: usage.notes,
            createdAt: usage.createdAt,
            updatedAt: usage.updatedAt,
            User: usage.User,
            Vehicle: usage.Vehicle
        };
    }
}

module.exports = new VehicleUsageService();