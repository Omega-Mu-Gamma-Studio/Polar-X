const express = require('express');
const cors = require('cors');
const http = require('http');
const { env } = require('./src/config/env');
const { connectDatabase } = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const models = require('./src/models');
const routes = require('./src/routes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const PORT = Number(env.PORT) || 5000;
const IS_DEV = env.NODE_ENV !== 'production';

const app = express();

// --- Middleware -----------------------------------------------------------
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// --- Routes ---------------------------------------------------------------
app.use('/api', routes);

// --- Error handling -------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

async function start() {
  // 1) Postgres + PostGIS
  await connectDatabase();
  if (IS_DEV) console.log('✓ Connected to Postgres (postgis enabled)');

  // 2) Create tables if they do not exist yet.
  //    Phase 0 uses sequelize.sync() — the blueprint defines no migrations/
  //    folder, so schema creation is driven by the model definitions in src/models.
  await models.sequelize.sync();
  if (IS_DEV) console.log('✓ Schema synced');

  // 3) HTTP server + Socket.io — real events emitted by controllers via getIO()
  const server = http.createServer(app);
  const io = initSocket(server);
  app.set('io', io);

  server.listen(PORT, () => {
    console.log(`❄️  PolarX server listening on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
}

start().catch((err) => {
  console.error('\n✗ Failed to start PolarX server.');
  console.error(`  ${err.message || err.code || err}`);
  console.error(
    '\n  Is Postgres running with PostGIS? Try:\n' +
      '    docker compose up -d\n' +
      '  and make sure server/.env points at the right database.\n'
  );
  process.exit(1);
});
