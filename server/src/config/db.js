const { Sequelize } = require('sequelize');
const { env } = require('./env');

/**
 * Sequelize instance for the PolarX Postgres database.
 * All models are registered in src/models/index.js.
 */
const sequelize = new Sequelize(
  env.DB_NAME || 'polarx',
  env.DB_USER || 'postgres',
  env.DB_PASSWORD || 'postgres',
  {
    host: env.DB_HOST || 'localhost',
    port: Number(env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true, // snake_case columns + timestamps
      freezeTableName: true, // table names match models exactly (see tableName)
    },
    pool: {
      max: 10,
      min: 0,
      idle: 5000, // recycle idle sockets aggressively so stale links don't linger
      acquire: 15000,
      evict: 1000,
    },
    dialectOptions: {
      // Keep sockets warm; helps across sleep/VM hiccups in dev environments.
      keepAlive: true,
    },
  }
);

/** Enable the PostGIS extension (idempotent). Geography columns need it to exist. */
async function ensurePostGIS() {
  await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
}

/** Ensure PostGIS is enabled and verify the connection works. */
async function connectDatabase() {
  await ensurePostGIS();
  await sequelize.authenticate();
  return sequelize;
}

module.exports = { sequelize, ensurePostGIS, connectDatabase };
