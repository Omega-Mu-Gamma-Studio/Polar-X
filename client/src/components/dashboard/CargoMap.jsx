import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Default Leaflet marker icons reference bundler-relative paths that break
// under Vite — point them at the CDN instead.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function CargoMap({ shipments = [] }) {
  const withCoords = shipments.filter((s) => s.locationLat && s.locationLng);

  return (
    <div className="rounded-xl overflow-hidden" style={{ height: 420, border: '1px solid var(--card-border)' }}>
      <MapContainer center={[-60, 40]} zoom={2} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; OpenStreetMap contributors'
        />
        {withCoords.map((s) => (
          <Marker key={s.id} position={[s.locationLat, s.locationLng]}>
            <Popup>
              <strong>{s.name}</strong>
              <br />
              {s.origin} &rarr; {s.destination}
              <br />
              Status: {s.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
