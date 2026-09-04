import { MapContainer, Polyline, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Station } from '@/services/stationsApi';
import { IconShield } from '@/components/common/Icons';

interface EvacuationMapProps {
  station: Station;
  className?: string;
}

/** Designated safe point: a short offset from the station (demo convention). */
function safePointFor(station: Station): { lat: number; lng: number } {
  const { lat, lng } = station.location ?? { lat: -69, lng: 10 };
  // Antarctica stations move "inland"; Himadri moves away from the fjord edge.
  return { lat: lat + (lat < 0 ? 0.35 : -0.3), lng: lng + 0.15 };
}

/** Evacuation route map — station → designated safe point, danger-red dashed. */
export default function EvacuationMap({ station, className }: EvacuationMapProps) {
  const stationPos: [number, number] = [
    station.location?.lat ?? -69,
    station.location?.lng ?? 10,
  ];
  const safe = safePointFor(station);
  const safePos: [number, number] = [safe.lat, safe.lng];

  return (
    <div className={className}>
      <MapContainer
        center={[(stationPos[0] + safePos[0]) / 2, (stationPos[1] + safePos[1]) / 2]}
        zoom={8}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {/* Safe point (rendered under the route) */}
        <CircleMarker center={safePos} radius={9} pathOptions={{ color: '#6fcf97', fillColor: '#6fcf97', fillOpacity: 0.35 }} />
        {/* Evacuation route */}
        <Polyline
          positions={[stationPos, safePos]}
          pathOptions={{ color: '#ff6b6b', weight: 3, opacity: 0.9, dashArray: '7 9' }}
        />
        {/* Station */}
        <CircleMarker center={stationPos} radius={9} pathOptions={{ color: '#ff6b6b', fillColor: '#ff6b6b', fillOpacity: 0.4 }}>
          <Popup>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{station.name} Station</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Alert origin</p>
          </Popup>
        </CircleMarker>
      </MapContainer>

      <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-[500] flex items-center gap-3 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-[10px] font-medium text-[var(--color-text-secondary)] backdrop-blur-sm">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-danger)' }} /> Station
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: 'var(--color-danger)' }} /> Evacuation route
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-success)' }} /> Safe point
        </span>
        <span className="inline-flex items-center gap-1">
          <IconShield width={11} height={11} className="text-[var(--color-success)]" />
          {station.name}
        </span>
      </div>
    </div>
  );
}