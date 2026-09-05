import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import PolarCard from '../components/common/PolarCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { getStatusColor } from '../utils/helpers.js';

const INITIAL_EMERGENCIES = [
  { id: 1, type: 'Storm warning', timestamp: '2026-09-01T08:00:00Z', status: 'active' },
];

export default function Emergency() {
  const [emergencies, setEmergencies] = useState(INITIAL_EMERGENCIES);

  function handleTrigger() {
    setEmergencies((prev) => [
      { id: Date.now(), type: 'Manual alert', timestamp: new Date().toISOString(), status: 'active' },
      ...prev,
    ]);
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl mb-1">Emergency</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Active and resolved incidents across all stations.
          </p>
        </div>
        <button
          onClick={handleTrigger}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--emergency-red)', color: '#fff' }}
        >
          Trigger test alert
        </button>
      </div>

      <PolarCard>
        <div className="flex flex-col divide-y" style={{ borderColor: 'var(--card-border)' }}>
          {emergencies.length === 0 && (
            <p className="text-sm py-4" style={{ color: 'var(--text-secondary)' }}>
              No emergencies logged.
            </p>
          )}
          {emergencies.map((e) => (
            <div key={e.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{e.type}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(e.timestamp).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={getStatusColor(e.status)} label={e.status} />
            </div>
          ))}
        </div>
      </PolarCard>
    </DashboardLayout>
  );
}
