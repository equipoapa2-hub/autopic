const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    plate: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('disponible', 'en_uso', 'mantenimiento', 'deshabilitado'),
        defaultValue: 'disponible'
    },
    fuelType: {
        type: DataTypes.ENUM('gasolina', 'diésel', 'eléctrico', 'híbrido'),
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true
});

Vehicle.associate = function (models) {
    Vehicle.hasMany(models.VehicleUsage, {
        foreignKey: 'vehicleId',
        as: 'VehicleUsages'
    });
};

module.exports = Vehicle;