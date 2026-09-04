/**
 * Phase 5 migration — extend `emergency_alerts` with the response-module
 * columns. This is the ONLY sanctioned schema change after Phase 0.
 *
 * Fresh databases get these columns automatically from the Sequelize model via
 * `sequelize.sync()`; this migration covers existing databases, and is
 * idempotent so it can be re-run safely.
 *
 * Run with: npm run migrate
 */
const { sequelize } = require('../config/db');

async function up() {
  // Fresh databases have no tables yet (schema is created by sequelize.sync() in
  // the seed script), so guard with to_regclass — the migration is a no-op there
  // and only extends an EXISTING emergency_alerts table. This keeps the
  // documented `npm run migrate && npm run seed` order working on both fresh and
  // existing databases.
  const [{ exists }] = await sequelize.query(
    "SELECT to_regclass('public.emergency_alerts') IS NOT NULL AS exists",
    { type: sequelize.QueryTypes.SELECT }
  );
  if (!exists) {
    console.log('• emergency_alerts does not exist yet (fresh DB) — migration skipped; seed will create the schema');
    return;
  }
  await sequelize.query(
    "ALTER TABLE emergency_alerts ADD COLUMN IF NOT EXISTS alert_type VARCHAR(40) NOT NULL DEFAULT 'Other';"
  );
  await sequelize.query('ALTER TABLE emergency_alerts ADD COLUMN IF NOT EXISTS description TEXT;');
  await sequelize.query(
    "ALTER TABLE emergency_alerts ADD COLUMN IF NOT EXISTS severity VARCHAR(12) NOT NULL DEFAULT 'info';"
  );
  await sequelize.query(
    "ALTER TABLE emergency_alerts ADD COLUMN IF NOT EXISTS checklist_items JSONB NOT NULL DEFAULT '[]'::jsonb;"
  );
}

async function down() {
  await sequelize.query('ALTER TABLE emergency_alerts DROP COLUMN IF EXISTS checklist_items;');
  await sequelize.query('ALTER TABLE emergency_alerts DROP COLUMN IF EXISTS severity;');
  await sequelize.query('ALTER TABLE emergency_alerts DROP COLUMN IF EXISTS description;');
  await sequelize.query('ALTER TABLE emergency_alerts DROP COLUMN IF EXISTS alert_type;');
}

// Direct execution: `node src/migrations/20260904000000-extend-emergency-alerts.js`
if (require.main === module) {
  up()
    .then(() => {
      console.log('✓ Migration applied: emergency_alerts extended (alert_type, description, severity, checklist_items)');
      return sequelize.close();
    })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('✗ Migration failed:', err.message || err);
      process.exit(1);
    });
}

module.exports = { up, down };