const { Mission, Station } = require('../models');
const { isUuid } = require('../middleware/validate');

function serializeMission(mission) {
  return {
    id: mission.id,
    name: mission.name,
    stationId: mission.station_id,
    startDate: mission.start_date,
    endDate: mission.end_date,
    status: mission.status,
    personnelCount: mission.personnel_count,
    cargoCount: mission.cargo_count,
    createdAt: mission.createdAt,
    updatedAt: mission.updatedAt,
    station: mission.station
      ? { id: mission.station.id, name: mission.station.name, region: mission.station.region }
      : null,
  };
}

const MISSION_STATION_INCLUDE = [{ model: Station, as: 'station', attributes: ['id', 'name', 'region'] }];

/** GET /api/missions?station_id=&status= */
async function index(req, res, next) {
  try {
    const where = {};
    const { station_id: stationId, status } = req.query;

    if (stationId) {
      if (!isUuid(stationId)) {
        return res.status(400).json({ error: 'Invalid station_id' });
      }
      where.station_id = stationId;
    }
    if (status) {
      if (!['planned', 'active', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'status must be planned, active or completed' });
      }
      where.status = status;
    }

    const missions = await Mission.findAll({
      where,
      include: MISSION_STATION_INCLUDE,
      order: [['start_date', 'DESC']],
    });

    // Status-count summary (matches the Blueprint): the Phase 0 schema models
    // upcoming missions as status 'planned', surfaced here as "upcoming".
    const summary = {
      active: missions.filter((m) => m.status === 'active').length,
      upcoming: missions.filter((m) => m.status === 'planned').length,
      completed: missions.filter((m) => m.status === 'completed').length,
    };
    res.json({ data: missions.map(serializeMission), summary });
  } catch (err) {
    next(err);
  }
}

/** POST /api/missions — create a mission (validated at route level). */
async function create(req, res, next) {
  const { name, station_id: stationId, start_date: startDate, end_date: endDate, status, personnel_count, cargo_count } = req.body;
  try {
    const station = await Station.findByPk(stationId);
    if (!station) {
      return res.status(400).json({ error: 'Referenced station does not exist' });
    }

    const mission = await Mission.create({
      name,
      station_id: stationId,
      start_date: startDate,
      end_date: endDate || null,
      status: status || 'planned',
      personnel_count: personnel_count ?? 0,
      cargo_count: cargo_count ?? 0,
    });

    const full = await Mission.findByPk(mission.id, { include: MISSION_STATION_INCLUDE });
    res.status(201).json({ data: serializeMission(full) });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, create, serializeMission };
