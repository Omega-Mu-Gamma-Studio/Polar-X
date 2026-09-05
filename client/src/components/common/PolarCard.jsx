export default function PolarCard({ title, action, children, className = '' }) {
  return (
    <div className={`polar-card p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-display text-base font-medium">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
