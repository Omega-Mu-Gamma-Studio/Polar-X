import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import PolarCard from '../components/common/PolarCard.jsx';

export default function Settings() {
  return (
    <DashboardLayout>
      <h1 className="font-display text-xl mb-6">Settings</h1>

      <PolarCard title="About" className="max-w-md">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>App</span>
            <span>PolarX</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Version</span>
            <span>0.1.0 (frontend prototype)</span>
          </div>
        </div>
      </PolarCard>
    </DashboardLayout>
  );
}
