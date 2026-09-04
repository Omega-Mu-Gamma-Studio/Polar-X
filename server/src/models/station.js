const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Station = sequelize.define(
    'Station',
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
      region: { type: DataTypes.ENUM('Antarctica', 'Arctic'), allowNull: false },
      location: { type: DataTypes.GEOGRAPHY('POINT', 4326), allowNull: false },
      capacity: { type: DataTypes.INTEGER, allowNull: false },
      personnel_on_station: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.ENUM('active', 'inactive'), allowNull: false, defaultValue: 'active' },
      founded_year: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: 'stations',
      indexes: [{ fields: ['region'] }, { fields: ['status'] }],
    }
  );

  return Station;
};
