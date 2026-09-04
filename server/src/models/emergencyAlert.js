const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EmergencyAlert = sequelize.define(
    'EmergencyAlert',
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      triggered_by: { type: DataTypes.UUID, allowNull: true }, // personnel id; null = system-triggered
      // Legacy generic type from Phase 0 — kept for schema compatibility and
      // mirrored to alert_type on every create so the column is never empty.
      type: { type: DataTypes.STRING(80), allowNull: false },
      // Canonical alert category (Phase 5): Medical | Fire | Weather | Equipment Failure | Other
      alert_type: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'Other' },
      description: { type: DataTypes.TEXT, allowNull: true },
      severity: { type: DataTypes.STRING(12), allowNull: false, defaultValue: 'info' }, // critical | warning | info
      station_id: { type: DataTypes.UUID, allowNull: false },
      location: { type: DataTypes.GEOGRAPHY('POINT', 4326), allowNull: true },
      timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      status: { type: DataTypes.ENUM('active', 'resolved'), allowNull: false, defaultValue: 'active' },
      checklist_items: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] }, // [{ id, label, completed }]
      // Derived convenience flag — recomputed server-side on every checklist change.
      checklist_completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: 'emergency_alerts',
      indexes: [
        { fields: ['triggered_by'] },
        { fields: ['station_id'] },
        { fields: ['status'] },
        { fields: ['timestamp'] },
      ],
    }
  );

  return EmergencyAlert;
};