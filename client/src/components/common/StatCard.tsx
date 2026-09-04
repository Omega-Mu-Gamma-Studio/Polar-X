import type { ReactNode } from 'react';
import ClayCard from './ClayCard';
import { cn } from '@/utils/cn';

export type StatTone = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_ROOT: Record<StatTone, string> = {
  default: 'accent',
  accent: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  neutral: 'neutral',
};

interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: StatTone;
  className?: string;
}

/** Summary tile — "256 Total Items"-style number with icon chip and label. */
export default function StatCard({
  icon,
  label,
  value,
  hint,
  tone = 'default',
  className,
}: StatCardProps) {
  const root = TONE_ROOT[tone];

  return (
    <ClayCard className={cn('flex items-center gap-4 p-5', className)}>
      {icon && (
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
          style={{
            background: `var(--color-${root}-soft)`,
            borderColor: `var(--color-${root}-border)`,
            color: `var(--color-${root})`,
          }}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <div className="font-display text-2xl font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]">
          {value}
        </div>
        <div className="mt-0.5 truncate text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
          {label}
        </div>
        {hint && (
          <div className="mt-0.5 truncate text-[11px] text-[var(--color-text-secondary)] opacity-70">
            {hint}
          </div>
        )}
      </div>
    </ClayCard>
  );
}
