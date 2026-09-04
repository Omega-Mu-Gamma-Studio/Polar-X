import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ClayCard from '@/components/common/ClayCard';
import { IconArrowRight } from '@/components/common/Icons';

export interface StripStat {
  label: string;
  value: number | string;
  /** Optional hue family applied to the value (accent/success/warning/danger/info/neutral). */
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

interface OverviewStripCardProps {
  title: string;
  icon: ReactNode;
  value: ReactNode;
  valueLabel: string;
  stats: StripStat[];
  to: string;
  /** While the backing API is loading, render a quiet placeholder instead of numbers. */
  loading?: boolean;
  /** When the backing API failed, surface it inline with a retry action. */
  error?: string | null;
  onRetry?: () => void;
}

const TONE_VAR: Record<NonNullable<StripStat['tone']>, string> = {
  accent: 'var(--color-accent)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
  neutral: 'var(--color-neutral)',
};

/** Clay summary tile used in the Dashboard bottom strip. */
export default function OverviewStripCard({
  title,
  icon,
  value,
  valueLabel,
  stats,
  to,
  loading = false,
  error = null,
  onRetry,
}: OverviewStripCardProps) {
  return (
    <Link
      to={to}
      className="group block h-full rounded-[20px] outline-offset-4"
      aria-label={`${title} — view all`}
    >
      <ClayCard className="flex h-full flex-col p-5 transition-all duration-200 hover:brightness-110">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            {icon}
            {title}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            View all
            <IconArrowRight width={12} height={12} />
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          {loading ? (
            <span
              className="h-7 w-20 animate-pulse rounded-lg bg-white/[0.06]"
              role="status"
              aria-label={`${title} loading`}
            />
          ) : error ? (
            <span className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <span>Unavailable</span>
              {onRetry && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault(); // keep the card link intact
                    onRetry();
                  }}
                  className="rounded-lg border border-[var(--color-border-glass)] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-[var(--color-accent)] transition-colors hover:bg-white/[0.08]"
                >
                  Retry
                </button>
              )}
            </span>
          ) : (
            <>
              <span className="font-display text-[28px] font-semibold leading-none tracking-tight text-[var(--color-text-primary)]">
                {value}
              </span>
              <span className="truncate text-xs text-[var(--color-text-secondary)]">{valueLabel}</span>
            </>
          )}
        </div>

        {!loading && !error && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
            {stats.map((stat) => (
              <span key={stat.label} className="inline-flex items-baseline gap-1.5 text-[11px]">
                <span
                  className="text-xs font-semibold tabular-nums"
                  style={{ color: stat.tone ? TONE_VAR[stat.tone] : 'var(--color-text-primary)' }}
                >
                  {stat.value}
                </span>
                <span className="text-[var(--color-text-secondary)]">{stat.label}</span>
              </span>
            ))}
          </div>
        )}
      </ClayCard>
    </Link>
  );
}
