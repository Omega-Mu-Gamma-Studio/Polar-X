import { cn } from '@/utils/cn';

export type ProgressTone = 'auto' | 'success' | 'warning' | 'danger' | 'accent' | 'info';

interface ProgressBarProps {
  /** Current value (0…max). */
  value: number;
  max?: number;
  /**
   * 'auto' picks a tone from the fill percentage assuming "higher = healthier"
   * (success ≥ 60%, warning 30–60%, danger below). Pass an explicit tone to opt out.
   */
  tone?: ProgressTone;
  size?: 'sm' | 'md';
  /** Optional caption row above the track. */
  label?: string;
  /** Show the computed percentage on the right of the caption row. */
  showValue?: boolean;
  className?: string;
}

function autoToneFor(pct: number): Exclude<ProgressTone, 'auto'> {
  if (pct >= 60) return 'success';
  if (pct >= 30) return 'warning';
  return 'danger';
}

export default function ProgressBar({
  value,
  max = 100,
  tone = 'auto',
  size = 'md',
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const safeMax = max <= 0 ? 1 : max;
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100));
  const resolved = tone === 'auto' ? autoToneFor(pct) : tone;

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {label && (
            <span className="truncate text-xs font-medium text-[var(--color-text-secondary)]">
              {label}
            </span>
          )}
          {showValue && (
            <span className="shrink-0 text-xs font-semibold tabular-nums text-[var(--color-text-primary)]">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={cn(
          'w-full overflow-hidden rounded-full bg-white/[0.06]',
          size === 'sm' ? 'h-1.5' : 'h-2'
        )}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%`, background: `var(--color-${resolved})` }}
        />
      </div>
    </div>
  );
}
