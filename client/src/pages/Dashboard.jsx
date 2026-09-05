import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import StationCard from '../components/dashboard/StationCard.jsx';
import InventoryWidget from '../components/dashboard/InventoryWidget.jsx';
import PersonnelWidget from '../components/dashboard/PersonnelWidget.jsx';

// Mock data — stands in until the backend is filled in. Shapes match the
// data models in README.md so swapping in real API calls later is a
// drop-in, not a rewrite.
const MOCK_STATIONS = [
  { name: 'Bharati', status: 'active', personnelCount: 41, capacity: 47, supplyDays: 52, activeMissions: 2 },
  { name: 'Maitri', status: 'active', personnelCount: 19, capacity: 25, supplyDays: 22, activeMissions: 1 },
  { name: 'Himadri', status: 'alert', personnelCount: 10, capacity: 12, supplyDays: 8, activeMissions: 1 },
];

const MOCK_INVENTORY_ALERTS = [
  { station: 'Himadri', item: 'Diesel fuel', quantity: 340, threshold: 500 },
  { station: 'Maitri', item: 'Fresh produce', quantity: 12, threshold: 40 },
];

const MOCK_PERSONNEL_COUNTS = { total: 70, onDuty: 52, inField: 9 };

export default function Dashboard() {
  const totalAlerts = MOCK_INVENTORY_ALERTS.length + MOCK_STATIONS.filter((s) => s.status === 'alert').length;

  return (
    <DashboardLayout alertCount={totalAlerts}>
      <h1 className="font-display text-xl mb-1">Mission overview</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Live status across all three stations.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {MOCK_STATIONS.map((s) => (
          <StationCard
            key={s.name}
            station={s.name}
            status={s.status}
            personnelCount={s.personnelCount}
            capacity={s.capacity}
            supplyDays={s.supplyDays}
            activeMissions={s.activeMissions}
          />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InventoryWidget alerts={MOCK_INVENTORY_ALERTS} />
        <PersonnelWidget counts={MOCK_PERSONNEL_COUNTS} />
      </div>
    </DashboardLayout>
  );
}
