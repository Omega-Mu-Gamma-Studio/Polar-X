const { Station, Mission } = require('../models');
const { toLatLng } = require('../models/geo');
const { isUuid } = require('../middleware/validate');

function serializeMission(mission) {
  const out = {
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
  };
  if (mission.station) {
    out.station = { id: mission.station.id, name: mission.station.name, region: mission.station.region };
  }
  return out;
}

function serializeStation(station) {
  return {
    id: station.id,
    name: station.name,
    region: station.region,
    location: toLatLng(station.location),
    capacity: station.capacity,
    personnelOnStation: station.personnel_on_station,
    status: station.status,
    foundedYear: station.founded_year,
    createdAt: station.createdAt,
    updatedAt: station.updatedAt,
  };
}

/** GET /api/stations — all research stations. */
async function index(req, res, next) {
  try {
    const stations = await Station.findAll({ order: [['founded_year', 'ASC']] });
    res.json({ data: stations.map(serializeStation) });
  } catch (err) {
    next(err);
  }
}

/** GET /api/stations/:id — station with its missions. */
async function show(req, res, next) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ error: 'Invalid station id' });
  }
  try {
    const station = await Station.findByPk(id, {
      include: [{ model: Mission, as: 'missions', separate: true, order: [['start_date', 'DESC']] }],
    });
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }
    const data = serializeStation(station);
    data.missions = station.missions.map(serializeMission);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, show };
