import type { CSSProperties, KeyboardEvent } from 'react';
import type { Station } from '@/services/stationsApi';
import ClayCard from '@/components/common/ClayCard';
import StatusBadge from '@/components/common/StatusBadge';
import { IconArrowRight, IconStations } from '@/components/common/Icons';
import { cn } from '@/utils/cn';

/**
 * Per-station accent tone used by the Phase 1 placeholder graphics:
 * Bharati = red-toned, Maitri = white/ice, Himadri = blue arctic.
 * Real photography can replace these later without touching card layout.
 */
const STATION_TONE: Record<string, string> = {
  Bharati: 'var(--color-danger)',
  Maitri: 'var(--color-text-primary)',
  Himadri: 'var(--color-info)',
};

function stationTone(name: string): string {
  return STATION_TONE[name] ?? 'var(--color-accent)';
}

function coordsLabel(station: Station): string {
  const { lat, lng } = station.location ?? { lat: 0, lng: 0 };
  const latLabel = `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`;
  const lngLabel = `${Math.abs(lng).toFixed(1)}°${lng >= 0 ? 'E' : 'W'}`;
  return `${latLabel} · ${lngLabel}`;
}

interface StationCardProps {
  station: Station;
  onOpen: (station: Station) => void;
}

export default function StationCard({ station, onOpen }: StationCardProps) {
  const tone = stationTone(station.name);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(station);
    }
  }

  const chipStyle: CSSProperties = {
    color: tone,
    background: `color-mix(in srgb, ${tone} 13%, transparent)`,
    borderColor: `color-mix(in srgb, ${tone} 32%, transparent)`,
  };

  return (
    <ClayCard
      role="button"
      tabIndex={0}
      aria-label={`Open ${station.name} details`}
      onClick={() => onOpen(station)}
      onKeyDown={handleKeyDown}
      className="group relative h-full cursor-pointer overflow-hidden p-5 transition-all duration-200 hover:brightness-110"
    >
      {/* Watermark icon */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-7 -top-7 opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.12]"
        style={{ color: tone }}
      >
        <IconStations width={140} height={140} />
      </span>

      <div className="relative flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
          style={chipStyle}
        >
          <IconStations width={22} height={22} />
        </span>
        <StatusBadge
          status={station.status === 'active' ? 'active' : 'warning'}
          size="sm"
          label={station.status === 'active' ? 'Active' : 'Inactive'}
        />
      </div>

      <h3 className="relative mt-3 font-display text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
        {station.name}
      </h3>
      <p className="relative mt-0.5 text-xs text-[var(--color-text-secondary)]">
        {station.region} · established {station.foundedYear}
      </p>

      {/* Capacity / On Station stat pair */}
      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--color-border-glass)] bg-white/[0.03] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Capacity
          </p>
          <p className="mt-1 font-display text-2xl font-semibold leading-none tabular-nums text-[var(--color-text-primary)]">
            {station.capacity}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border-glass)] bg-white/[0.03] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            On station
          </p>
          <p className="mt-1 font-display text-2xl font-semibold leading-none tabular-nums text-[var(--color-text-primary)]">
            {station.personnelOnStation}
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="truncate text-[11px] text-[var(--color-text-secondary)]">
          {station.location ? coordsLabel(station) : 'Coordinates unavailable'}
        </span>
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 group-hover:translate-x-0.5'
          )}
          style={chipStyle}
        >
          <IconArrowRight width={13} height={13} />
        </span>
      </div>
    </ClayCard>
  );
}
