const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { env } = require('../config/env');

/**
 * JWT auth middleware (Phase 7).
 *
 * Reads `Authorization: Bearer <token>`, verifies the signature, hydrates the
 * user, and attaches it as `req.user`. Returns 401 (never 500) for missing or
 * invalid tokens. Applied to every mutating route; read-only GETs stay public
 * for demo convenience (documented in the README).
 */
async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findByPk(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };