const LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  alert: 'Alert',
};

export default function StatusBadge({ status = 'inactive', label }) {
  return (
    <span className={`status-badge ${status}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'currentColor',
          display: 'inline-block',
        }}
      />
      {label ?? LABELS[status] ?? status}
    </span>
  );
}
