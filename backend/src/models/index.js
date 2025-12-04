const User = require('./User');
const Vehicle = require('./Vehicle');
const VehicleUsage = require('./VehicleUsage');

const models = {
  User,
  Vehicle,
  VehicleUsage
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;