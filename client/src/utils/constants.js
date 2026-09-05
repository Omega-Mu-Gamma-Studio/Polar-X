export const STATIONS = ['Bharati', 'Maitri', 'Himadri'];

export const STATION_COORDS = {
  Bharati: { lat: -69.41, lng: 76.19 },
  Maitri: { lat: -70.77, lng: 11.73 },
  Himadri: { lat: 78.92, lng: 11.93 },
};

export const STATION_CAPACITY = {
  Bharati: 47,
  Maitri: 25,
  Himadri: 12,
};

export const SOCKET_EVENTS = {
  CARGO_UPDATE: 'cargo:update',
  CARGO_SUBSCRIBE: 'cargo:subscribe',
  EMERGENCY_ALERT: 'emergency:alert',
  EMERGENCY_TRIGGER: 'emergency:trigger',
  PERSONNEL_LOCATION: 'personnel:location',
  INVENTORY_LOW: 'inventory:low',
};

export const SUPPLY_ALERT_DAYS = 30;
export const LOW_STOCK_THRESHOLD_MULTIPLIER = 1.2;

// Nav items shared by Sidebar — icon keys match the ICONS map in Sidebar.jsx
export const NAV_ITEMS = [
  { label: 'Overview', path: '/dashboard', icon: 'grid' },
  { label: 'Cargo', path: '/dashboard/cargo', icon: 'map' },
  { label: 'Inventory', path: '/dashboard/inventory', icon: 'box' },
  { label: 'Personnel', path: '/dashboard/personnel', icon: 'users' },
  { label: 'Emergency', path: '/dashboard/emergency', icon: 'alert' },
  { label: 'Settings', path: '/dashboard/settings', icon: 'settings' },
];
