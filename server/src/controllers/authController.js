const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { env } = require('../config/env');

const BCRYPT_ROUNDS = 10;

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    stationId: user.station_id,
    createdAt: user.createdAt,
  };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
}

/** POST /api/auth/register — create an account; never returns the hash. */
async function register(req, res, next) {
  const { name, email, password, role, station_id: stationId } = req.body;
  try {
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: role || 'viewer',
      station_id: stationId || null,
    });

    res.status(201).json({ data: { token: signToken(user), user: serializeUser(user) } });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/login — returns { token, user }. */
async function login(req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email: (email || '').toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password || '', user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ data: { token: signToken(user), user: serializeUser(user) } });
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me — protected; returns the user from the JWT (via authenticate). */
async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'Account no longer exists' });
    }
    res.json({ data: { user: serializeUser(user) } });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, serializeUser };