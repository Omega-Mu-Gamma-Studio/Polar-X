const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InventoryItem = sequelize.define(
    'InventoryItem',
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      station_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING(150), allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      threshold: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      // Derived from quantity vs threshold, but stored for cheap filtering/querying.
      status: {
        type: DataTypes.ENUM('adequate', 'low-stock', 'critical', 'out-of-stock'),
        allowNull: false,
        defaultValue: 'adequate',
      },
      expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
      last_restocked: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'inventory_items',
      indexes: [
        { fields: ['station_id'] },
        { fields: ['status'] },
        { fields: ['expiry_date'] },
      ],
    }
  );

  return InventoryItem;
};
