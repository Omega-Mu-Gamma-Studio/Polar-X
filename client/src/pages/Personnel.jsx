import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import PolarCard from '../components/common/PolarCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { getStatusColor } from '../utils/helpers.js';

const MOCK_PERSONNEL = [
  { id: 1, name: 'Dr. Priya Nair', role: 'Expedition Leader', station: 'Bharati', status: 'in-field' },
  { id: 2, name: 'Arjun Menon', role: 'Logistics Officer', station: 'Bharati', status: 'on-duty' },
  { id: 3, name: 'Kavya Reddy', role: 'Field Researcher', station: 'Maitri', status: 'on-duty' },
  { id: 4, name: 'Sam Thomas', role: 'Engineer', station: 'Himadri', status: 'in-field' },
];

export default function Personnel() {
  return (
    <DashboardLayout>
      <h1 className="font-display text-xl mb-1">Personnel</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Roster across all stations, with current duty status.
      </p>

      <PolarCard>
        <div className="flex flex-col divide-y" style={{ borderColor: 'var(--card-border)' }}>
          {MOCK_PERSONNEL.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {p.role} &middot; {p.station}
                </p>
              </div>
              <StatusBadge status={getStatusColor(p.status)} label={p.status} />
            </div>
          ))}
        </div>
      </PolarCard>
    </DashboardLayout>
  );
}
