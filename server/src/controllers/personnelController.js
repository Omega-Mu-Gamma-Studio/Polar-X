const { Personnel, Station } = require('../models');
const { Op } = require('sequelize');
const { toGeoJSON, toLatLng } = require('../models/geo');
const { isUuid } = require('../middleware/validate');
const { getIO } = require('../config/socket');

const PERSONNEL_STATUSES = ['on-duty', 'in-field', 'at-base', 'on-leave'];

function serializePerson(person) {
  const out = {
    id: person.id,
    name: person.name,
    role: person.role,
    stationId: person.station_id,
    qualifications: person.qualifications || [],
    rotationStart: person.rotation_start,
    rotationEnd: person.rotation_end,
    currentLocation: toLatLng(person.current_location),
    status: person.status,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
  };
  if (person.station) {
    out.stationName = person.station.name;
    out.stationRegion = person.station.region;
  }
  return out;
}

function summarize(people) {
  return {
    total: people.length,
    onDuty: people.filter((p) => p.status === 'on-duty').length,
    inField: people.filter((p) => p.status === 'in-field').length,
    atBase: people.filter((p) => p.status === 'at-base').length,
    onLeave: people.filter((p) => p.status === 'on-leave').length,
  };
}

const STATION_INCLUDE = { model: Station, as: 'station', attributes: ['id', 'name', 'region'] };

/**
 * GET /api/personnel
 * Query: station_id (uuid), status, role. Returns personnel joined with their
 * station plus a summary computed over the exact rows returned.
 */
async function index(req, res, next) {
  try {
    const where = {};
    const { station_id: stationId, status, role } = req.query;

    if (stationId) {
      if (!isUuid(stationId)) {
        return res.status(400).json({ error: 'station_id must be a valid uuid' });
      }
      where.station_id = stationId;
    }
    if (status) {
      if (!PERSONNEL_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'status must be on-duty, in-field, at-base or on-leave' });
      }
      where.status = status;
    }
    if (role) {
      where.role = { [Op.iLike]: role }; // exact role match, case-insensitive
    }

    const people = await Personnel.findAll({
      where,
      include: [STATION_INCLUDE],
      order: [
        ['name', 'ASC'],
        ['station_id', 'ASC'],
      ],
    });

    res.json({ data: people.map(serializePerson), summary: summarize(people) });
  } catch (err) {
    next(err);
  }
}

/** GET /api/personnel/:id */
async function show(req, res, next) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ error: 'Invalid personnel id' });
  }
  try {
    const person = await Personnel.findByPk(id, { include: [STATION_INCLUDE] });
    if (!person) {
      return res.status(404).json({ error: 'Personnel record not found' });
    }
    res.json({ data: serializePerson(person) });
  } catch (err) {
    next(err);
  }
}

/** POST /api/personnel (validated at route level). */
async function create(req, res, next) {
  const {
    name,
    role,
    station_id: stationId,
    rotation_start: rotationStart,
    rotation_end: rotationEnd,
    qualifications,
    status,
    current_location: currentLocation,
  } = req.body;
  try {
    const station = await Station.findByPk(stationId);
    if (!station) {
      return res.status(400).json({ error: 'Referenced station does not exist' });
    }

    const person = await Personnel.create({
      name,
      role,
      station_id: stationId,
      rotation_start: rotationStart,
      rotation_end: rotationEnd || null,
      qualifications: Array.isArray(qualifications) ? qualifications : [],
      status: status || 'at-base',
      current_location: toGeoJSON(currentLocation),
    });

    const full = await Personnel.findByPk(person.id, { include: [STATION_INCLUDE] });
    res.status(201).json({ data: serializePerson(full) });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/personnel/:id/status — status changes from the UI / live tracking. */
async function updateStatus(req, res, next) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ error: 'Invalid personnel id' });
  }
  try {
    const person = await Personnel.findByPk(id);
    if (!person) {
      return res.status(404).json({ error: 'Personnel record not found' });
    }
    const { status } = req.body;
    await person.update({ status });
    const full = await Personnel.findByPk(person.id, { include: [STATION_INCLUDE] });
    const payload = serializePerson(full);
    getIO().emit('personnel:update', payload);
    res.json({ data: payload });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/personnel/:id/location — field-tracking updates (Socket.io in Phase 7). */
async function updateLocation(req, res, next) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ error: 'Invalid personnel id' });
  }
  try {
    const person = await Personnel.findByPk(id);
    if (!person) {
      return res.status(404).json({ error: 'Personnel record not found' });
    }
    const { current_location: currentLocation } = req.body;
    await person.update({ current_location: toGeoJSON(currentLocation) });
    const full = await Personnel.findByPk(person.id, { include: [STATION_INCLUDE] });
    const payload = serializePerson(full);
    getIO().emit('personnel:update', payload);
    res.json({ data: payload });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, show, create, updateStatus, updateLocation, serializePerson };