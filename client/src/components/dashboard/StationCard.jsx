import PolarCard from '../common/PolarCard.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { SUPPLY_ALERT_DAYS } from '../../utils/constants.js';

export default function StationCard({ station, status, personnelCount, capacity, supplyDays, activeMissions }) {
  const supplyLow = supplyDays < SUPPLY_ALERT_DAYS;
  const pct = Math.round((personnelCount / capacity) * 100);

  return (
    <PolarCard title={station} action={<StatusBadge status={status} />}>
      <div className="space-y-3 text-sm">
        <div>
          <div className="flex justify-between mb-1" style={{ color: 'var(--text-secondary)' }}>
            <span>Personnel</span>
            <span>{personnelCount} / {capacity}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: 'var(--accent-primary)' }}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <span style={{ color: 'var(--text-secondary)' }}>Supply runway</span>
          <span style={{ color: supplyLow ? 'var(--emergency-red)' : 'var(--text-primary)' }}>
            {supplyDays} days
          </span>
        </div>

        <div className="flex justify-between">
          <span style={{ color: 'var(--text-secondary)' }}>Active missions</span>
          <span>{activeMissions}</span>
        </div>
      </div>
    </PolarCard>
  );
}
