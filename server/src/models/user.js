const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(120), allowNull: false },
      email: { type: DataTypes.STRING(160), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      role: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'viewer' },
      station_id: { type: DataTypes.UUID, allowNull: true },
    },
    {
      tableName: 'users',
      indexes: [
        { fields: ['station_id'] },
        { fields: ['role'] },
      ],
    }
  );

  return User;
};
