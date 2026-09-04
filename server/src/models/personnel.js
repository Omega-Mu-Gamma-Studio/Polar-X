const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Personnel = sequelize.define(
    'Personnel',
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(120), allowNull: false },
      role: { type: DataTypes.STRING(120), allowNull: false },
      station_id: { type: DataTypes.UUID, allowNull: true },
      qualifications: { type: DataTypes.JSONB, allowNull: true }, // array of qualification strings
      rotation_start: { type: DataTypes.DATEONLY, allowNull: true },
      rotation_end: { type: DataTypes.DATEONLY, allowNull: true },
      current_location: { type: DataTypes.GEOGRAPHY('POINT', 4326), allowNull: true },
      status: {
        type: DataTypes.ENUM('on-duty', 'in-field', 'at-base', 'on-leave'),
        allowNull: false,
        defaultValue: 'at-base',
      },
    },
    {
      tableName: 'personnel',
      indexes: [
        { fields: ['station_id'] },
        { fields: ['status'] },
      ],
    }
  );

  return Personnel;
};
