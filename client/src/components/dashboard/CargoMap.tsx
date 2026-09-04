import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Station } from '@/services/stationsApi';
import type { Shipment, ShipmentStatus } from '@/services/cargoApi';
import StatusBadge from '@/components/common/StatusBadge';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/datetime';

/**
 * Route line colors per shipment status. Kept as literal hex here because
 * Leaflet needs concrete stroke colors for SVG polylines (CSS variables do not
 * resolve in presentation attributes). Matches the palette tokens:
 * in-transit = glacier blue accent, delivered = aurora green, delayed = red.
 */
export const STATUS_ROUTE_COLORS: Record<ShipmentStatus, string> = {
  'in-transit': '#A8D8F0',
  delivered: '#6FCF97',
  delayed: '#FF6B6B',
};

/** Known origin ports so routes can start from a real coordinate. */
const HUB_COORDS: Record<string, { lat: number; lng: number }> = {
  'goa, india': { lat: 15.2993, lng: 74.124 },
  'cape town, south africa': { lat: -33.9249, lng: 18.4241 },
  'tromsø, norway': { lat: 69.6492, lng: 18.9553 },
  'longyearbyen, svalbard': { lat: 78.2232, lng: 15.6267 },
};

export interface LatLngPoint {
  lat: number;
  lng: number;
}

type LatLngTuple = [number, number];

export const stationMarkerIcon = L.divIcon({
  className: '',
  html: '<span class="px-marker-station"><span class="px-ping"></span><span class="px-ring"></span><span class="px-core"></span></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -15],
});

export function shipmentMarkerIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<span class="px-ship" style="--m:${color}"><span class="px-ship-ping"></span><span class="px-ship-dot"></span></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

function toTuple(p: LatLngPoint): LatLngTuple {
  return [p.lat, p.lng];
}

/** Resolve an origin/destination text to coordinates (station name or known hub). */
function resolveEndpoint(text: string, stations: Station[]): LatLngPoint | null {
  const normalized = text.trim().toLowerCase();
  const station = stations.find((s) => s.name.toLowerCase() === normalized);
  if (station?.location) return station.location;
  return HUB_COORDS[normalized] ?? null;
}

/** Route polyline origin → current location → destination (consecutive duplicates removed). */
function buildRoute(shipment: Shipment, stations: Station[]): LatLngPoint[] {
  const raw = [
    resolveEndpoint(shipment.origin, stations),
    shipment.currentLocation,
    resolveEndpoint(shipment.destination, stations),
  ].filter((p): p is LatLngPoint => p !== null);
  return raw.filter(
    (point, index) =>
      index === 0 ||
      point.lat !== raw[index - 1].lat ||
      point.lng !== raw[index - 1].lng
  );
}

function ShipmentPopupBody({ shipment }: { shipment: Shipment }) {
  const itemCount = shipment.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="min-w-[220px] max-w-[260px]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-snug text-[var(--color-text-primary)]">
          {shipment.name}
        </p>
        <StatusBadge status={shipment.status} size="sm" className="shrink-0" />
      </div>
      <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
        {shipment.origin} <span aria-hidden>→</span> {shipment.destination}
      </p>
      <dl className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--color-text-secondary)]">ETA</dt>
          <dd className="font-medium text-[var(--color-text-primary)]">
            {shipment.eta ? formatDateTime(shipment.eta) : '—'}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--color-text-secondary)]">Manifest</dt>
          <dd className="font-medium text-[var(--color-text-primary)]">
            {shipment.items.length} line{itemCount !== 1 ? 's' : ''}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/** Re-fits the map to the visible points whenever the dataset changes. */
function FitBounds({ points }: { points: LatLngPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const timer = window.setTimeout(() => {
      if (points.length === 1) {
        map.setView(toTuple(points[0]), 6);
      } else {
        map.fitBounds(L.latLngBounds(points.map(toTuple)), { padding: [30, 30], maxZoom: 6 });
      }
      map.invalidateSize();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [map, points]);
  return null;
}

interface CargoMapProps {
  stations: Station[];
  shipments: Shipment[];
  /** Height is controlled by the wrapper (e.g. className="h-[440px]"). */
  className?: string;
  /** Only fit the viewport to shipment routes (used by mini route maps). */
  fitShipmentOnly?: boolean;
}

/**
 * Map surface: station pins + one dashed route line per shipment, colored by
 * status. Clicking a marker or line opens a glass popup with shipment details.
 */
export default function CargoMap({
  stations,
  shipments,
  className,
  fitShipmentOnly = false,
}: CargoMapProps) {
  const { boundsPoints, routes } = useMemo(() => {
    const bound: LatLngPoint[] = [];
    if (!fitShipmentOnly) {
      stations.forEach((s) => {
        if (s.location) bound.push(s.location);
      });
    }
    const built = shipments.map((shipment) => buildRoute(shipment, stations));
    built.forEach((route) => route.forEach((p) => bound.push(p)));
    shipments.forEach((s) => {
      if (s.currentLocation) bound.push(s.currentLocation);
    });
    return { boundsPoints: bound, routes: built };
  }, [stations, shipments]);

  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl', className)}>
      <MapContainer
        center={[-63, 15]}
        zoom={2}
        zoomControl
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {stations.map(
          (station) =>
            station.location && (
              <Marker key={station.id} position={toTuple(station.location)} icon={stationMarkerIcon}>
                <Popup>
                  <div className="min-w-[190px]">
                    <p className="flex items-center justify-between gap-3 text-sm font-semibold text-[var(--color-text-primary)]">
                      {station.name}
                      <StatusBadge status="active" size="sm" label={station.region} />
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {station.personnelOnStation} / {station.capacity} personnel · est.{' '}
                      {station.foundedYear}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
        )}

        {shipments.map((shipment, index) => {
          const route = routes[index];
          if (route.length < 2) return null;
          return (
            <Polyline
              key={`route-${shipment.id}`}
              positions={route.map(toTuple)}
              pathOptions={{
                color: STATUS_ROUTE_COLORS[shipment.status],
                weight: 2.5,
                opacity: 0.8,
                dashArray: '7 9',
                lineCap: 'round',
              }}
            >
              <Popup>
                <ShipmentPopupBody shipment={shipment} />
              </Popup>
            </Polyline>
          );
        })}

        {shipments.map((shipment) =>
          shipment.currentLocation ? (
            <Marker
              key={`shipment-${shipment.id}`}
              position={toTuple(shipment.currentLocation)}
              icon={shipmentMarkerIcon(STATUS_ROUTE_COLORS[shipment.status])}
            >
              <Popup>
                <ShipmentPopupBody shipment={shipment} />
              </Popup>
            </Marker>
          ) : null
        )}

        <FitBounds points={boundsPoints} />
      </MapContainer>
    </div>
  );
}

const LEGEND_ITEMS: Array<{ label: string; color: string; status?: ShipmentStatus }> = [
  { label: 'In Transit', color: STATUS_ROUTE_COLORS['in-transit'] },
  { label: 'Delivered', color: STATUS_ROUTE_COLORS.delivered },
  { label: 'Delayed', color: STATUS_ROUTE_COLORS.delayed },
  { label: 'Station', color: 'var(--color-accent)' },
];

/** Small dot + label legend row for shipment statuses and stations. */
export function MapLegend({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5', className)}>
      {LEGEND_ITEMS.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-text-secondary)]"
        >
          <span
            aria-hidden
            className="h-2 w-2 rounded-full"
            style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
          />
          {item.label}
        </span>        ))}
    </div>
  );
}
