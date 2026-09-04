const { randomUUID } = require('node:crypto');
const { EmergencyAlert, Personnel, Station } = require('../models');
const { toLatLng } = require('../models/geo');
const { isUuid } = require('../middleware/validate');
const { getIO } = require('../config/socket');

const ALERT_TYPES = ['Medical', 'Fire', 'Weather', 'Equipment Failure', 'Other'];
const SEVERITIES = ['critical', 'warning', 'info'];

/**
 * Default response checklists per alert type (Phase 5 spec). Each entry is
 * { id, label, completed }; ids are stable UUIDs generated once here so the
 * checklist PATCH endpoint can address them.
 */
const DEFAULT_CHECKLISTS = {
  Medical: [
    'Notify station medic',
    'Isolate/stabilize patient',
    'Contact MoES HQ',
    'Prepare evacuation route if needed',
  ],
  Fire: [
    'Sound alarm',
    'Evacuate affected area',
    'Deploy fire suppression',
    'Confirm all personnel accounted for',
  ],
  Weather: [
    'Issue shelter-in-place notice',
    'Secure equipment/cargo',
    'Suspend outdoor operations',
    'Monitor forecast for all-clear',
  ],
  'Equipment Failure': [
    'Isolate affected system',
    'Notify technical lead',
    'Assess backup/redundancy',
    'Log for post-incident review',
  ],
  Other: [
    'Assess situation',
    'Notify station commander',
    'Contact MoES HQ',
    'Log resolution',
  ],
};

/** Sensible default severity per alert type (overridable by the client). */
const DEFAULT_SEVERITY = {
  Medical: 'critical',
  Fire: 'critical',
  Weather: 'warning',
  'Equipment Failure': 'warning',
  Other: 'info',
};

function buildChecklist(alertType) {
  return (DEFAULT_CHECKLISTS[alertType] || DEFAULT_CHECKLISTS.Other).map((label) => ({
    id: randomUUID(),
    label,
    completed: false,
  }));
}

function allCompleted(checklistItems) {
  return Array.isArray(checklistItems) && checklistItems.length > 0 && checklistItems.every((item) => item.completed);
}

function serializeAlert(alert) {
  const out = {
    id: alert.id,
    alertType: alert.alert_type,
    description: alert.description,
    severity: alert.severity,
    stationId: alert.station_id,
    location: toLatLng(alert.location),
    timestamp: alert.timestamp,
    status: alert.status,
    checklistItems: alert.checklist_items || [],
    checklistCompleted: alert.checklist_completed,
    triggeredById: alert.triggered_by,
    createdAt: alert.createdAt,
    updatedAt: alert.updatedAt,
  };
  if (alert.station) {
    out.stationName = alert.station.name;
    out.stationRegion = alert.station.region;
  }
  if (alert.trigger) {
    out.triggeredByName = alert.trigger.name;
    out.triggeredByRole = alert.trigger.role;
  }
  return out;
}

const ALERT_INCLUDE = [
  { model: Station, as: 'station', attributes: ['id', 'name', 'region', 'location'] },
  { model: Personnel, as: 'trigger', attributes: ['id', 'name', 'role'] },
];

/**
 * GET /api/emergency/alerts?status=&severity=
 * Returns alerts joined with station + triggering personnel, plus a summary
 * computed over the returned rows: { active, critical, warning, info, resolved }.
 */
async function index(req, res, next) {
  try {
    const where = {};
    const { status, severity } = req.query;

    if (status) {
      if (!['active', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'status must be active or resolved' });
      }
      where.status = status;
    }
    if (severity) {
      if (!SEVERITIES.includes(severity)) {
        return res.status(400).json({ error: 'severity must be critical, warning or info' });
      }
      where.severity = severity;
    }

    const alerts = await EmergencyAlert.findAll({
      where,
      include: ALERT_INCLUDE,
      order: [
        ['status', 'ASC'], // active first
        ['timestamp', 'DESC'],
      ],
    });

    const activeRows = alerts.filter((a) => a.status === 'active');
    const summary = {
      // Status counts across everything returned…
      active: activeRows.length,
      resolved: alerts.filter((a) => a.status === 'resolved').length,
      // …but severity counts only describe currently-active alerts, which is
      // how the Dashboard's "Active Alerts" card presents them.
      critical: activeRows.filter((a) => a.severity === 'critical').length,
      warning: activeRows.filter((a) => a.severity === 'warning').length,
      info: activeRows.filter((a) => a.severity === 'info').length,
    };

    res.json({ data: alerts.map(serializeAlert), summary });
  } catch (err) {
    next(err);
  }
}

/** GET /api/emergency/alerts/:id */
async function show(req, res, next) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ error: 'Invalid alert id' });
  }
  try {
    const alert = await EmergencyAlert.findByPk(id, { include: ALERT_INCLUDE });
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ data: serializeAlert(alert) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/emergency/trigger (validated at route level).
 * Creates an alert with the type-specific default checklist pre-populated.
 * location defaults to the station's coordinates so the evacuation map has a
 * meaningful anchor. Severity defaults per alert type unless overridden.
 */
async function trigger(req, res, next) {
  const { alert_type: alertType, station_id: stationId, triggered_by: triggeredBy, description, severity } = req.body;
  try {
    const station = await Station.findByPk(stationId);
    if (!station) {
      return res.status(400).json({ error: 'Referenced station does not exist' });
    }
    if (triggeredBy) {
      const person = await Personnel.findByPk(triggeredBy);
      if (!person) {
        return res.status(400).json({ error: 'Referenced personnel (triggered_by) does not exist' });
      }
    }

    const alert = await EmergencyAlert.create({
      triggered_by: triggeredBy || null,
      type: alertType, // legacy mirror of alert_type
      alert_type: alertType,
      description: description || null,
      severity: severity || DEFAULT_SEVERITY[alertType] || 'info',
      station_id: stationId,
      location: station.location,
      status: 'active',
      checklist_items: buildChecklist(alertType),
      checklist_completed: false,
    });

    const full = await EmergencyAlert.findByPk(alert.id, { include: ALERT_INCLUDE });
    const payload = serializeAlert(full);
    getIO().emit('alert:new', payload);
    res.status(201).json({ data: payload });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/emergency/alerts/:id/checklist
 * Body: { item_id, completed }. Flips one checklist item and recomputes
 * checklist_completed server-side — the client never sets it directly.
 */
async function updateChecklist(req, res, next) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ error: 'Invalid alert id' });
  }
  const { item_id: itemId, completed } = req.body;
  try {
    const alert = await EmergencyAlert.findByPk(id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    if (alert.status === 'resolved') {
      return res.status(400).json({ error: 'Resolved alerts cannot be edited' });
    }

    const items = (alert.checklist_items || []).map((item) =>
      String(item.id) === String(itemId) ? { ...item, completed: Boolean(completed) } : item
    );
    if (!items.some((item) => String(item.id) === String(itemId))) {
      return res.status(400).json({ error: 'Checklist item not found on this alert' });
    }

    await alert.update({
      checklist_items: items,
      checklist_completed: allCompleted(items),
    });

    const full = await EmergencyAlert.findByPk(alert.id, { include: ALERT_INCLUDE });
    const payload = serializeAlert(full);
    getIO().emit('alert:update', payload);
    res.json({ data: payload });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/emergency/alerts/:id/resolve
 * Only allowed once the checklist is 100% complete — otherwise 400 with a
 * clear message (per Phase 5 spec).
 */
async function resolve(req, res, next) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ error: 'Invalid alert id' });
  }
  try {
    const alert = await EmergencyAlert.findByPk(id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    if (!allCompleted(alert.checklist_items)) {
      return res.status(400).json({
        error: 'Checklist must be 100% complete before this alert can be resolved',
      });
    }

    await alert.update({ status: 'resolved' });
    const full = await EmergencyAlert.findByPk(alert.id, { include: ALERT_INCLUDE });
    const payload = serializeAlert(full);
    getIO().emit('alert:update', payload);
    res.json({ data: payload });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, show, trigger, updateChecklist, resolve, DEFAULT_CHECKLISTS, DEFAULT_SEVERITY, buildChecklist };