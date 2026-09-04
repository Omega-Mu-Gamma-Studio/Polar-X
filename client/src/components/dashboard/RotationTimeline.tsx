import type { Personnel } from '@/services/personnelApi';
import GlassCard from '@/components/common/GlassCard';
import { formatDate } from '@/utils/datetime';
import { initialsFor } from './PersonnelCard';

interface RotationTimelineProps {
  people: Personnel[];
}

/** Days from today until the given date-only string (null-safe). */
function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const end = new Date(`${iso}T00:00:00`).getTime();
  if (Number.isNaN(end)) return null;
  return Math.ceil((end - Date.now()) / 86_400_000);
}

/** Lightweight rotation timeline — who is rotating out within the next 30 days. */
export default function RotationTimeline({ people }: RotationTimelineProps) {
  const rotations = people
    .map((person) => ({ person, days: daysUntil(person.rotationEnd) }))
    .filter((entry): entry is { person: Personnel; days: number } => entry.days !== null && entry.days >= 0 && entry.days <= 30)
    .sort((a, b) => a.days - b.days);

  return (
    <GlassCard>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
          Rotation Timeline
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Rotations ending in the next 30 days
        </p>
      </div>

      {rotations.length === 0 ? (
        <p className="mt-4 rounded-xl border border-[var(--color-border-glass)] bg-white/[0.02] px-4 py-8 text-center text-sm text-[var(--color-text-secondary)]">
          No rotations end within the next 30 days.
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {rotations.map(({ person, days }) => (
            <li
              key={person.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border-glass)] bg-white/[0.02] px-3.5 py-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] text-xs font-semibold text-[var(--color-accent)]">
                {initialsFor(person.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{person.name}</p>
                <p className="truncate text-[11px] text-[var(--color-text-secondary)]">
                  {person.role} · {person.stationName ?? 'Unassigned'}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold tabular-nums text-[var(--color-warning)]">
                  {days === 0 ? 'today' : `${days}d`}
                </p>
                <p className="text-[10px] text-[var(--color-text-secondary)]">
                  {person.rotationEnd ? formatDate(person.rotationEnd) : ''}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </GlassCard>
  );
}