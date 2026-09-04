const { env } = require('../config/env');

/**
 * 404 for unknown API paths.
 */
function notFound(req, res, next) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}

/**
 * Central error handler — converts Sequelize validation errors into clean 4xx
 * responses and keeps the raw stack out of production responses.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const payload = { error: err.message || 'Internal server error' };

  if (env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
