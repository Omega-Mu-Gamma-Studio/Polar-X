const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Shipment = sequelize.define(
    'Shipment',
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(150), allowNull: false },
      mission_id: { type: DataTypes.UUID, allowNull: true }, // can travel outside a mission
      origin: { type: DataTypes.TEXT, allowNull: false },
      destination: { type: DataTypes.TEXT, allowNull: false },
      current_location: { type: DataTypes.GEOGRAPHY('POINT', 4326), allowNull: true },
      status: { type: DataTypes.ENUM('in-transit', 'delivered', 'delayed'), allowNull: false, defaultValue: 'in-transit' },
      eta: { type: DataTypes.DATE, allowNull: true },
      items: { type: DataTypes.JSONB, allowNull: true }, // manifest
    },
    {
      tableName: 'shipments',
      indexes: [
        { fields: ['mission_id'] },
        { fields: ['status'] },
        { fields: ['eta'] },
      ],
    }
  );

  return Shipment;
};
