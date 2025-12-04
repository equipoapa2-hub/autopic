const { User } = require('../models');
const { Op } = require('sequelize'); 

class UserService {
    async create(userData) {
        try {
            const user = await User.create(userData);
            return this._sanitizeUser(user);
        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    async authenticate(email, password) {
        try {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return null;
            }

            const isValidPassword = await user.comparePassword(password);

            if (!isValidPassword) {
                return null;
            }

            return this._sanitizeUser(user);
        } catch (error) {
            throw new Error(`Error al autenticar usuario: ${error.message}`);
        }
    }

    async updateProfile(userId, updateData) {
        try {
            const allowedFields = ['name', 'lastName1', 'lastName2', 'email', 'phone'];
            const filteredData = {};

            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            });

            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            await user.update(filteredData);
            return this._sanitizeUser(user);
        } catch (error) {
            throw new Error(`Error al actualizar perfil: ${error.message}`);
        }
    }

    async updatePassword(userId, newPassword) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            await user.update({ passwordHash: newPassword });
        } catch (error) {
            throw new Error(`Error al actualizar contraseña: ${error.message}`);
        }
    }

    async getAllUsers(filters = {}) {
        try {
            const whereClause = {};

            if (filters.search) {
                whereClause[Op.or] = [
                    { name: { [Op.iLike]: `%${filters.search}%` } },
                    { lastName1: { [Op.iLike]: `%${filters.search}%` } },
                    { lastName2: { [Op.iLike]: `%${filters.search}%` } },
                    { email: { [Op.iLike]: `%${filters.search}%` } }
                ];
            }

            if (filters.role) {
                whereClause.role = filters.role;
            }

            const users = await User.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']]
            });

            return users.map(user => this._sanitizeUser(user));
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    async getUserById(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return this._sanitizeUser(user);
        } catch (error) {
            throw new Error(`Error al obtener usuario: ${error.message}`);
        }
    }

    async deleteUser(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            await user.destroy();
        } catch (error) {
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }

    _sanitizeUser(user) {
        return {
            id: user.id,
            name: user.name,
            lastName1: user.lastName1,
            lastName2: user.lastName2,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
}

module.exports = new UserService();