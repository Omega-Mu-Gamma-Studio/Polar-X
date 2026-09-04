/**
 * Geometry helpers for the PostGIS `geography` columns.
 *
 * Sequelize reads geography columns back as GeoJSON objects
 * ({ type: 'Point', coordinates: [lng, lat] }), and accepts the same shape
 * when writing. These helpers keep that conversion at the API boundary so
 * controllers can work with plain { lat, lng } and never leak SRID/GeoJSON
 * plumbing to the client.
 */

function isValidLatLng(ll) {
  return (
    ll &&
    typeof ll.lat === 'number' &&
    typeof ll.lng === 'number' &&
    Number.isFinite(ll.lat) &&
    Number.isFinite(ll.lng)
  );
}

/** { lat, lng } → GeoJSON Point for storage (null when invalid). */
function toGeoJSON(latLng) {
  if (!isValidLatLng(latLng)) return null;
  return { type: 'Point', coordinates: [latLng.lng, latLng.lat] };
}

/** Minimal EWKB hex decoder for POINTs (defensive; Sequelize usually gives GeoJSON). */
function parseEwkbHex(hex) {
  try {
    const buf = Buffer.from(hex, 'hex');
    if (buf.length < 21) return null; // header + at least one double
    const littleEndian = buf[0] === 1;
    const readUInt = littleEndian ? 'readUInt32LE' : 'readUInt32BE';
    const readDouble = littleEndian ? 'readDoubleLE' : 'readDoubleBE';
    const wkbType = buf[readUInt](1);
    const hasSrid = (wkbType & 0x20000000) !== 0;
    const geometryType = wkbType & 0x0fffffff;
    if (geometryType !== 1) return null; // only POINT supported
    const offset = 1 + 4 + (hasSrid ? 4 : 0);
    if (buf.length < offset + 16) return null;
    const lng = buf[readDouble](offset);
    const lat = buf[readDouble](offset + 8);
    return { lat, lng };
  } catch {
    return null;
  }
}

/** Geography value (GeoJSON, EWKB hex or WKT) → { lat, lng } | null. */
function toLatLng(value) {
  if (!value) return null;

  // GeoJSON Point — what Sequelize returns for geography columns.
  if (
    typeof value === 'object' &&
    value.type === 'Point' &&
    Array.isArray(value.coordinates) &&
    value.coordinates.length >= 2
  ) {
    return { lat: value.coordinates[1], lng: value.coordinates[0] };
  }

  if (typeof value === 'string') {
    const text = value.trim();
    if (/^[0-9a-fA-F]+$/.test(text)) {
      const parsed = parseEwkbHex(text);
      if (parsed) return parsed;
    }
    // WKT or SRID-prefixed WKT: "POINT(lng lat)"
    const match = text.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (match) {
      return { lng: Number(match[1]), lat: Number(match[2]) };
    }
  }

  return null;
}

module.exports = { toGeoJSON, toLatLng, isValidLatLng };
