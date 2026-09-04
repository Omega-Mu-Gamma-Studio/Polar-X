const { InventoryItem, Station } = require('../models');
const { Op } = require('sequelize');
const { isUuid } = require('../middleware/validate');
const { getIO } = require('../config/socket');

const INVENTORY_STATUSES = ['adequate', 'low-stock', 'critical', 'out-of-stock'];

/**
 * Derive stock status from quantity vs threshold — NEVER trust a client-supplied
 * status. Threshold policy (documented for the team to tune later):
 *
 *   quantity === 0                     → 'out-of-stock'
 *   quantity <= floor(0.3 × threshold) → 'critical'   (at/below 30% of threshold)
 *   quantity <= threshold              → 'low-stock'  (below the reorder point)
 *   otherwise                          → 'adequate'
 *
 * A threshold of 0 means "no reorder point defined" → adequate while q > 0.
 */
function deriveInventoryStatus(quantity, threshold) {
  if (!Number.isFinite(quantity) || quantity <= 0) return 'out-of-stock';
  if (!Number.isFinite(threshold) || threshold <= 0) return 'adequate';
  if (quantity <= Math.floor(threshold * 0.3)) return 'critical';
  if (quantity <= threshold) return 'low-stock';
  return 'adequate';
}

function serializeItem(item) {
  const out = {
    id: item.id,
    stationId: item.station_id,
    name: item.name,
    quantity: item.quantity,
    threshold: item.threshold,
    status: deriveInventoryStatus(item.quantity, item.threshold),
    expiryDate: item.expiry_date,
    lastRestocked: item.last_restocked,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
  if (item.station) {
    out.stationName = item.station.name;
    out.stationRegion = item.station.region;
  }
  return out;
}

function summarize(items) {
  return {
    total: items.length,
    adequate: items.filter((i) => deriveInventoryStatus(i.quantity, i.threshold) === 'adequate').length,
    lowStock: items.filter((i) => deriveInventoryStatus(i.quantity, i.threshold) === 'low-stock').length,
    critical: items.filter((i) => deriveInventoryStatus(i.quantity, i.threshold) === 'critical').length,
    outOfStock: items.filter((i) => deriveInventoryStatus(i.quantity, i.threshold) === 'out-of-stock').length,
  };
}

const STATION_INCLUDE = { model: Station, as: 'station', attributes: ['id', 'name', 'region'] };

/** Midnight of today + n days (used for expiry-window filters). */
function daysFromNow(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

/** Date-only strings ('YYYY-MM-DD') survive JSON round trips fine as-is. */
function toDateOnly(date) {
  return date instanceof Date ? date.toISOString().slice(0, 10) : date;
}

/**
 * GET /api/inventory
 * Query: station_id (uuid), status, expiring_within_days (int).
 *
 * The dataset is small (demo scale), so station/expiry narrow the query in SQL
 * and the status filter + summary are computed in JS from the one authoritative
 * deriveInventoryStatus() function — the summary always matches the rows shown.
 */
async function index(req, res, next) {
  try {
    const where = {};
    const { station_id: stationId, status, expiring_within_days: expiringWithinDays } = req.query;

    if (stationId) {
      if (!isUuid(stationId)) {
        return res.status(400).json({ error: 'station_id must be a valid uuid' });
      }
      where.station_id = stationId;
    }
    if (expiringWithinDays !== undefined) {
      const days = Number(expiringWithinDays);
      if (!Number.isInteger(days) || days < 1 || days > 3650) {
        return res.status(400).json({ error: 'expiring_within_days must be an integer between 1 and 3650' });
      }
      where.expiry_date = { [Op.between]: [daysFromNow(0), daysFromNow(days)] };
    }

    const items = await InventoryItem.findAll({
      where,
      include: [STATION_INCLUDE],
      order: [
        ['name', 'ASC'],
        ['station_id', 'ASC'],
      ],
    });

    if (status) {
      if (!INVENTORY_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'status must be adequate, low-stock, critical or out-of-stock' });
      }
      const filtered = items.filter((i) => deriveInventoryStatus(i.quantity, i.threshold) === status);
      return res.json({ data: filtered.map(serializeItem), summary: summarize(filtered) });
    }

    res.json({ data: items.map(serializeItem), summary: summarize(items) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/inventory/alerts
 * Everything needing attention right now: critical, out-of-stock, or expiring
 * within 7 days (matches the Blueprint's documented endpoint).
 */
async function alerts(req, res, next) {
  try {
    const items = await InventoryItem.findAll({
      where: {
        [Op.or]: [{ expiry_date: { [Op.between]: [daysFromNow(0), daysFromNow(7)] } }],
      },
      include: [STATION_INCLUDE],
      order: [
        ['expiry_date', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    const needingAttention = items.filter((item) => {
      const derived = deriveInventoryStatus(item.quantity, item.threshold);
      if (derived === 'critical' || derived === 'out-of-stock') return true;
      // Expiring inside the next 7 days (or already past — stale stock also
      // needs attention, surfaced by the client as an expired row).
      const expiresOn = item.expiry_date ? new Date(`${item.expiry_date}T00:00:00`) : null;
      if (expiresOn && !Number.isNaN(expiresOn.getTime())) {
        const cutoff = daysFromNow(7).getTime();
        if (expiresOn.getTime() <= cutoff) return true;
      }
      return false;
    });

    res.json({ data: needingAttention.map(serializeItem) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/inventory (validated at route level).
 * Status is derived here — never taken from the request body.
 */
async function create(req, res, next) {
  const { station_id: stationId, name, quantity, threshold, expiry_date: expiryDate } = req.body;
  try {
    const station = await Station.findByPk(stationId);
    if (!station) {
      return res.status(400).json({ error: 'Referenced station does not exist' });
    }

    const item = await InventoryItem.create({
      station_id: stationId,
      name,
      quantity,
      threshold,
      status: deriveInventoryStatus(quantity, threshold),
      expiry_date: expiryDate || null,
      last_restocked: new Date(),
    });

    const full = await InventoryItem.findByPk(item.id, { include: [STATION_INCLUDE] });
    const payload = serializeItem(full);
    getIO().emit('inventory:update', payload);
    res.status(201).json({ data: payload });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/inventory/:id — used by the Restock action (quantity), but also
 * supports threshold / expiry / name edits. Status is always re-derived and
 * last_restocked bumps whenever the quantity changes.
 */
async function update(req, res, next) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ error: 'Invalid inventory item id' });
  }
  try {
    const item = await InventoryItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const { name, quantity, threshold, expiry_date: expiryDate } = req.body;
    const patch = {};
    if (name !== undefined) patch.name = name;
    if (quantity !== undefined) {
      patch.quantity = quantity;
      patch.last_restocked = new Date(); // restock / consumption event
    }
    if (threshold !== undefined) patch.threshold = threshold;
    if (expiryDate !== undefined) patch.expiry_date = expiryDate ? toDateOnly(expiryDate) : null;

    const nextQuantity = patch.quantity ?? item.quantity;
    const nextThreshold = patch.threshold ?? item.threshold;
    patch.status = deriveInventoryStatus(nextQuantity, nextThreshold);

    await item.update(patch);
    const full = await InventoryItem.findByPk(item.id, { include: [STATION_INCLUDE] });
    const payload = serializeItem(full);
    getIO().emit('inventory:update', payload);
    res.json({ data: payload });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/inventory/:id — decommissioned / fully consumed stock. */
async function remove(req, res, next) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ error: 'Invalid inventory item id' });
  }
  try {
    const item = await InventoryItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    await item.destroy();
    getIO().emit('inventory:update', { id, deleted: true });
    res.json({ data: { id } });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, alerts, create, update, remove, deriveInventoryStatus, serializeItem };
