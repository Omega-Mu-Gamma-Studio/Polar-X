import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import PolarCard from '../components/common/PolarCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';

const MOCK_INVENTORY = {
  Bharati: [
    { id: 1, name: 'Diesel fuel', quantity: 1800, threshold: 600, lastRestocked: '2026-08-01' },
    { id: 2, name: 'Dry rations', quantity: 900, threshold: 300, lastRestocked: '2026-08-01' },
  ],
  Maitri: [
    { id: 3, name: 'Fresh produce', quantity: 12, threshold: 40, lastRestocked: '2026-08-20' },
    { id: 4, name: 'Diesel fuel', quantity: 700, threshold: 500, lastRestocked: '2026-08-10' },
  ],
  Himadri: [
    { id: 5, name: 'Diesel fuel', quantity: 340, threshold: 500, lastRestocked: '2026-07-15' },
    { id: 6, name: 'Medical supplies', quantity: 80, threshold: 50, lastRestocked: '2026-08-05' },
  ],
};

export default function Inventory() {
  return (
    <DashboardLayout>
      <h1 className="font-display text-xl mb-1">Inventory</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Stock levels per station, checked against restock thresholds.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(MOCK_INVENTORY).map(([station, list]) => (
          <PolarCard key={station} title={station}>
            <div className="flex flex-col gap-3">
              {list.map((item) => {
                const low = item.quantity <= item.threshold;
                return (
                  <div key={item.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {low && <StatusBadge status="alert" label="Low" />}
                    </div>
                    <div className="flex items-center justify-between text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      <span>{item.quantity} / threshold {item.threshold}</span>
                      <span>Restocked {item.lastRestocked}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </PolarCard>
        ))}
      </div>
    </DashboardLayout>
  );
}
