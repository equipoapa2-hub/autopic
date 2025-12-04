const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VehicleUsage = sequelize.define('VehicleUsage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Vehicles',
            key: 'id'
        }
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('activo', 'completado'),
        defaultValue: 'activo'
    },
    startMileage: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    endMileage: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

VehicleUsage.associate = function (models) {
    VehicleUsage.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'User'
    });
    VehicleUsage.belongsTo(models.Vehicle, {
        foreignKey: 'vehicleId',
        as: 'Vehicle'
    });
};

module.exports = VehicleUsage;
