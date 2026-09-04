import type { Personnel } from '@/services/personnelApi';
import ClayCard from '@/components/common/ClayCard';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDate } from '@/utils/datetime';
import { cn } from '@/utils/cn';

interface PersonnelCardProps {
  person: Personnel;
  onOpen: (person: Personnel) => void;
}

/** Initials from the first letters of the first two name parts. */
export function initialsFor(name: string): string {
  const parts = name.replace(/^(Dr\.|Capt\.|Lt\.|Cmdr\.|Er\.|Mr\.|Mrs\.|Ms\.|S\.|A\.)\s+/i, '').trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '?';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + second).toUpperCase();
}

const STATION_TONE: Record<string, 'accent' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'> = {
  Bharati: 'danger',
  Maitri: 'accent',
  Himadri: 'info',
};

export default function PersonnelCard({ person, onOpen }: PersonnelCardProps) {
  const tone = person.stationName ? (STATION_TONE[person.stationName] ?? 'neutral') : 'neutral';
  const qualsShown = person.qualifications.slice(0, 3);
  const rotationLabel =
    person.rotationStart && person.rotationEnd
      ? `Rotation: ${formatDate(person.rotationStart)} – ${formatDate(person.rotationEnd)}`
      : 'Rotation: not scheduled';

  return (
    <button
      type="button"
      onClick={() => onOpen(person)}
      className="group block h-full w-full text-left outline-offset-4"
      aria-label={`Open ${person.name} details`}
    >
      <ClayCard className="flex h-full flex-col p-5 transition-all duration-200 hover:brightness-110">
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border font-display text-base font-semibold"
            style={{
              background: `var(--color-${tone}-soft)`,
              borderColor: `var(--color-${tone}-border)`,
              color: `var(--color-${tone})`,
            }}
          >
            {initialsFor(person.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
              {person.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]">{person.role}</p>
            <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-secondary)] opacity-80">
              {person.stationName ?? 'Unassigned'}
            </p>
          </div>
          <StatusBadge status={person.status} size="sm" />
        </div>

        <p className="mt-3.5 text-[11px] text-[var(--color-text-secondary)]">{rotationLabel}</p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
          {qualsShown.map((qual) => (
            <span
              key={qual}
              className="rounded-md border border-[var(--color-border-glass)] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]"
            >
              {qual}
            </span>
          ))}
          {person.qualifications.length > qualsShown.length && (
            <span className="self-center text-[10px] text-[var(--color-text-secondary)] opacity-70">
              +{person.qualifications.length - qualsShown.length} more
            </span>
          )}
        </div>

        <span className={cn('mt-3 text-[11px] font-medium text-[var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-100')}>
          View details →
        </span>
      </ClayCard>
    </button>
  );
}