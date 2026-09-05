import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import PolarCard from '../components/common/PolarCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import CargoMapView from '../components/dashboard/CargoMap.jsx';
import { getStatusColor } from '../utils/helpers.js';

const MOCK_SHIPMENTS = [
  { id: 1, name: 'Fuel & Rations Consignment 1', origin: 'Cape Town', destination: 'Bharati', locationLat: -45.0, locationLng: 40.0, status: 'in-transit', eta: '2026-09-20' },
  { id: 2, name: 'Equipment Resupply', origin: 'Chennai', destination: 'Maitri', locationLat: -50.0, locationLng: 20.0, status: 'preparing', eta: '2026-10-01' },
  { id: 3, name: 'Medical Airlift', origin: 'Cape Town', destination: 'Himadri', locationLat: 60.0, locationLng: 15.0, status: 'delivered', eta: '2026-08-28' },
];

export default function CargoMapPage() {
  return (
    <DashboardLayout>
      <h1 className="font-display text-xl mb-1">Cargo map</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Live shipment positions across all active missions.
      </p>

      <div className="mb-6">
        <CargoMapView shipments={MOCK_SHIPMENTS} />
      </div>

      <PolarCard title="Shipments">
        <div className="flex flex-col divide-y" style={{ borderColor: 'var(--card-border)' }}>
          {MOCK_SHIPMENTS.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {s.origin} &rarr; {s.destination}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={getStatusColor(s.status)} label={s.status} />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  ETA {s.eta}
                </p>
              </div>
            </div>
          ))}
        </div>
      </PolarCard>
    </DashboardLayout>
  );
}
