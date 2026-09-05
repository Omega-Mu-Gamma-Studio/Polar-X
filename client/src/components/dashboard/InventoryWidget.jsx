import PolarCard from '../common/PolarCard.jsx';

// alerts: [{ station, item, quantity, threshold }]
export default function InventoryWidget({ alerts = [] }) {
  return (
    <PolarCard title="Low stock alerts">
      {alerts.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          All stations above threshold.
        </p>
      ) : (
        <ul className="space-y-3 text-sm">
          {alerts.map((a) => (
            <li key={`${a.station}-${a.item}`} className="flex justify-between">
              <div>
                <p>{a.item}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{a.station}</p>
              </div>
              <span style={{ color: 'var(--emergency-red)' }}>
                {a.quantity} / {a.threshold}
              </span>
            </li>
          ))}
        </ul>
      )}
    </PolarCard>
  );
}
