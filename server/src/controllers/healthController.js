/**
 * GET /api/health — liveness check used by the client and ops tooling.
 */
const { sequelize } = require('../models');

async function getHealth(req, res, next) {
  try {
    await sequelize.query('SELECT 1;');
    res.json({
      status: 'ok',
      service: 'polarx-server',
      database: 'connected',
      time: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    });
  } catch (err) {
    res.status(503).json({ status: 'degraded', service: 'polarx-server', database: 'unreachable' });
    next(err);
  }
}

module.exports = { getHealth };
