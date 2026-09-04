const sequelize = require('../config/db').sequelize;
const { DataTypes } = require('sequelize');

// Load each model (each file receives the shared sequelize instance).
const Station = require('./station')(sequelize);
const Mission = require('./mission')(sequelize);
const Shipment = require('./shipment')(sequelize);
const InventoryItem = require('./inventoryItem')(sequelize);
const Personnel = require('./personnel')(sequelize);
const EmergencyAlert = require('./emergencyAlert')(sequelize);
const User = require('./user')(sequelize);

// --- Associations & foreign keys -----------------------------------------
// stations 1—n missions
Station.hasMany(Mission, { foreignKey: 'station_id', as: 'missions', onDelete: 'CASCADE' });
Mission.belongsTo(Station, { foreignKey: 'station_id', as: 'station' });

// missions 1—n shipments (shipment may exist without a mission)
Mission.hasMany(Shipment, { foreignKey: 'mission_id', as: 'shipments', onDelete: 'SET NULL' });
Shipment.belongsTo(Mission, { foreignKey: 'mission_id', as: 'mission' });

// stations 1—n inventory items
Station.hasMany(InventoryItem, { foreignKey: 'station_id', as: 'inventoryItems', onDelete: 'CASCADE' });
InventoryItem.belongsTo(Station, { foreignKey: 'station_id', as: 'station' });

// stations 1—n personnel
Station.hasMany(Personnel, { foreignKey: 'station_id', as: 'personnel', onDelete: 'SET NULL' });
Personnel.belongsTo(Station, { foreignKey: 'station_id', as: 'station' });

// stations 1—n emergency alerts; personnel 1—n alerts (triggered_by)
Station.hasMany(EmergencyAlert, { foreignKey: 'station_id', as: 'emergencyAlerts', onDelete: 'CASCADE' });
EmergencyAlert.belongsTo(Station, { foreignKey: 'station_id', as: 'station' });
Personnel.hasMany(EmergencyAlert, { foreignKey: 'triggered_by', as: 'triggeredAlerts', onDelete: 'SET NULL' });
EmergencyAlert.belongsTo(Personnel, { foreignKey: 'triggered_by', as: 'trigger' });

// stations 1—n users (auth accounts, Phase 7)
Station.hasMany(User, { foreignKey: 'station_id', as: 'users', onDelete: 'SET NULL' });
User.belongsTo(Station, { foreignKey: 'station_id', as: 'station' });

module.exports = {
  sequelize,
  DataTypes,
  Station,
  Mission,
  Shipment,
  InventoryItem,
  Personnel,
  EmergencyAlert,
  User,
};
