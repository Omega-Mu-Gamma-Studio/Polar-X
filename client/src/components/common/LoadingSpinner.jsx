export default function LoadingSpinner({ size = 32, label = 'Loading' }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex items-center justify-center"
      style={{ padding: '2rem' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="var(--card-border)"
          strokeWidth="4"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="4"
          strokeDasharray="90 150"
          strokeLinecap="round"
        />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
