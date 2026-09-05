export function formatDate(dateInput) {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function calcSupplyDays(quantity, dailyUsage) {
  if (!dailyUsage || dailyUsage <= 0) return Infinity;
  return Math.floor(quantity / dailyUsage);
}

export function getStatusColor(status) {
  switch (status) {
    case 'active':
    case 'on-track':
    case 'delivered':
    case 'on-duty':
    case 'in-field':
    case 'in-transit':
    case 'resolved':
      return 'active';
    case 'alert':
    case 'critical':
    case 'low-stock':
    case 'delayed':
      return 'alert';
    default:
      return 'inactive';
  }
}

// Haversine distance in km — used until PostGIS is wired in (see ARCHITECTURE.md)
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
