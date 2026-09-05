import PolarCard from '../common/PolarCard.jsx';

// counts: { onDuty, inField, total }
export default function PersonnelWidget({ counts }) {
  const { onDuty, inField, total } = counts;
  return (
    <PolarCard title="Personnel">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="font-display text-2xl">{onDuty}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>On duty</p>
        </div>
        <div>
          <p className="font-display text-2xl">{inField}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>In field</p>
        </div>
        <div>
          <p className="font-display text-2xl">{total}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total</p>
        </div>
      </div>
    </PolarCard>
  );
}
