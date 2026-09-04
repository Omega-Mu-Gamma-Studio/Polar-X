const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Mission = sequelize.define(
    'Mission',
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(150), allowNull: false },
      station_id: { type: DataTypes.UUID, allowNull: false },
      start_date: { type: DataTypes.DATEONLY, allowNull: false },
      end_date: { type: DataTypes.DATEONLY, allowNull: true },
      status: { type: DataTypes.ENUM('planned', 'active', 'completed'), allowNull: false, defaultValue: 'planned' },
      personnel_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      cargo_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: 'missions',
      indexes: [
        { fields: ['station_id'] },
        { fields: ['status'] },
        { fields: ['start_date'] },
      ],
    }
  );

  return Mission;
};
