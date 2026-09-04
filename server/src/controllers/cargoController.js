const { Mission, Shipment, Station } = require('../models');
const { Op } = require('sequelize');
const { toGeoJSON, toLatLng } = require('../models/geo');
const { isUuid } = require('../middleware/validate');
const { getIO } = require('../config/socket');

const SHIPMENT_STATUSES = ['in-transit', 'delivered', 'delayed'];

/** Mission summary nested into shipment responses. */
function serializeShipment(shipment) {
  const mission = shipment.mission;
  const station = mission && mission.station;
  return {
    id: shipment.id,
    name: shipment.name,
    origin: shipment.origin,
    destination: shipment.destination,
    status: shipment.status,
    eta: shipment.eta,
    items: shipment.items || [],
    currentLocation: toLatLng(shipment.current_location),
    mission: mission
      ? {
          id: mission.id,
          name: mission.name,
          status: mission.status,
          stationId: mission.station_id,
          stationName: station ? station.name : null,
          stationRegion: station ? station.region : null,
        }
      : null,
    createdAt: shipment.createdAt,
    updatedAt: shipment.updatedAt,
  };
}

const SHIPMENT_INCLUDE = [
  {
    model: Mission,
    as: 'mission',
    include: [{ model: Station, as: 'station', attributes: ['id', 'name', 'region'] }],
  },
];

/** GET /api/cargo/shipments?status=&destination=&limit= */
async function index(req, res, next) {
  try {
    const where = {};
    const { status, destination, limit } = req.query;

    if (status) {
      if (!SHIPMENT_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'status must be in-transit, delivered or delayed' });
      }
      where.status = status;
    }
    if (destination) {
      where.destination = { [Op.iLike]: `%${destination}%` };
    }

    const options = {
      where,
      include: SHIPMENT_INCLUDE,
      order: [['createdAt', 'DESC']],
    };
    if (limit !== undefined) {
      const parsed = Number(limit);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
        return res.status(400).json({ error: 'limit must be an integer between 1 and 100' });
      }
      options.limit = parsed;
    }

    const shipments = await Shipment.findAll(options);
    res.json({ data: shipments.map(serializeShipment) });
  } catch (err) {
    next(err);
  }
}

/** Shared loader for /:id and /:id/track. */
async function findShipmentOr404(res, id) {
  if (!isUuid(id)) {
    res.status(400).json({ error: 'Invalid shipment id' });
    return null;
  }
  const shipment = await Shipment.findByPk(id, { include: SHIPMENT_INCLUDE });
  if (!shipment) {
    res.status(404).json({ error: 'Shipment not found' });
    return null;
  }
  return shipment;
}

/** GET /api/cargo/shipments/:id */
async function show(req, res, next) {
  try {
    const shipment = await findShipmentOr404(res, req.params.id);
    if (!shipment) return;
    res.json({ data: serializeShipment(shipment) });
  } catch (err) {
    next(err);
  }
}

/** GET /api/cargo/shipments/:id/track — same payload, framed for the tracking drawer. */
async function track(req, res, next) {
  try {
    const shipment = await findShipmentOr404(res, req.params.id);
    if (!shipment) return;
    res.json({ data: serializeShipment(shipment) });
  } catch (err) {
    next(err);
  }
}

/** POST /api/cargo/shipments (validated at route level). */
async function create(req, res, next) {
  const {
    name,
    origin,
    destination,
    mission_id: missionId,
    status,
    eta,
    items,
    current_location: currentLocation,
  } = req.body;
  try {
    if (missionId) {
      const mission = await Mission.findByPk(missionId);
      if (!mission) {
        return res.status(400).json({ error: 'Referenced mission does not exist' });
      }
    }

    const shipment = await Shipment.create({
      name,
      origin,
      destination,
      mission_id: missionId || null,
      status: status || 'in-transit',
      eta: eta || null,
      items: Array.isArray(items) ? items : [],
      current_location: toGeoJSON(currentLocation),
    });

    const full = await Shipment.findByPk(shipment.id, { include: SHIPMENT_INCLUDE });
    res.status(201).json({ data: serializeShipment(full) });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/cargo/shipments/:id/status
 * Accepts an optional current_location ({lat,lng}) so later phases can simulate
 * live movement; when marking delivered without one, the shipment is snapped to
 * its destination station's coordinates.
 */
async function updateStatus(req, res, next) {
  const { status, current_location: currentLocation } = req.body;
  try {
    const shipment = await findShipmentOr404(res, req.params.id);
    if (!shipment) return;

    const patch = { status };
    if (currentLocation) {
      patch.current_location = toGeoJSON(currentLocation);
    } else if (status === 'delivered') {
      const station = await Station.findOne({
        where: { name: { [Op.iLike]: shipment.destination } },
      });
      if (station) patch.current_location = station.location;
    }

    await shipment.update(patch);
    const fresh = await Shipment.findByPk(shipment.id, { include: SHIPMENT_INCLUDE });
    const payload = serializeShipment(fresh);
    getIO().emit('shipment:update', payload);
    res.json({ data: payload });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, show, track, create, updateStatus, serializeShipment };
