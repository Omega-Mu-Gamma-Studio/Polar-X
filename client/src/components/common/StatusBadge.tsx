import { cn } from '@/utils/cn';

export type BadgeStatus =
  | 'active'
  | 'in-transit'
  | 'delivered'
  | 'delayed'
  | 'critical'
  | 'warning'
  | 'info'
  | 'on-duty'
  | 'in-field'
  | 'at-base'
  | 'on-leave'
  | 'adequate'
  | 'low-stock'
  | 'out-of-stock'
  | 'resolved';

type ToneRoot = 'success' | 'accent' | 'danger' | 'warning' | 'info' | 'neutral';

/** Map each domain status onto a shared hue family. */
const STATUS_TONE: Record<BadgeStatus, ToneRoot> = {
  active: 'success',
  delivered: 'success',
  'on-duty': 'success',
  adequate: 'success',
  'in-transit': 'accent',
  'in-field': 'accent',
  delayed: 'danger',
  critical: 'danger',
  'out-of-stock': 'danger',
  'low-stock': 'warning',
  'on-leave': 'warning',
  warning: 'warning',
  info: 'info',
  'at-base': 'neutral',
  resolved: 'neutral',
};

/** Critical uses a stronger tint so it stands apart from ordinary "delayed". */
const STRONG_TINT: BadgeStatus[] = ['critical'];

function humanize(status: BadgeStatus): string {
  return status
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface StatusBadgeProps {
  status: BadgeStatus;
  /** Override the default humanized label (e.g. status="active" label="Live"). */
  label?: string;
  size?: 'sm' | 'md';
  /** Pulsing dot. Defaults on for critical. */
  pulse?: boolean;
  className?: string;
}

export default function StatusBadge({
  status,
  label,
  size = 'md',
  pulse,
  className,
}: StatusBadgeProps) {
  const root = STATUS_TONE[status];
  const tint = STRONG_TINT.includes(status) ? 'critical' : root;
  const pulseDot = pulse ?? status === 'critical';

  return (
    <span
      className={cn(
        'inline-flex select-none items-center whitespace-nowrap rounded-full border font-medium',
        size === 'sm' ? 'gap-1.5 px-2 py-0.5 text-[11px]' : 'gap-2 px-2.5 py-1 text-xs',
        className
      )}
      style={{
        background: `var(--color-${tint}-soft)`,
        borderColor: `var(--color-${tint}-border)`,
        color: `var(--color-${root})`,
      }}
    >
      <span className="relative inline-flex h-1.5 w-1.5">
        {pulseDot && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ background: `var(--color-${root})` }}
          />
        )}
        <span
          className="relative inline-flex h-1.5 w-1.5 rounded-full"
          style={{ background: `var(--color-${root})` }}
        />
      </span>
      {label ?? humanize(status)}
    </span>
  );
}
