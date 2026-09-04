import { useState } from 'react';
import { useStations } from '@/hooks/useStations';
import type { Station, StationRegion } from '@/services/stationsApi';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import StationCard from '@/components/dashboard/StationCard';
import StationDetailModal from '@/components/dashboard/StationDetailModal';
import { cn } from '@/utils/cn';

type RegionFilter = 'all' | StationRegion;

const REGION_OPTIONS: Array<{ value: RegionFilter; label: string }> = [
  { value: 'all', label: 'All regions' },
  { value: 'Antarctica', label: 'Antarctica' },
  { value: 'Arctic', label: 'Arctic' },
];

export default function Stations() {
  const { stations, loading, error, refetch } = useStations();
  const [region, setRegion] = useState<RegionFilter>('all');
  const [selected, setSelected] = useState<Station | null>(null);

  const visible =
    region === 'all' ? stations : stations.filter((station) => station.region === region);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stations"
        subtitle="Bharati · Maitri · Himadri — status & operations"
      />

      {/* Region filter */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] p-1 sm:w-fit">
        {REGION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={region === option.value}
            onClick={() => setRegion(option.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              region === option.value
                ? 'bg-white/10 text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState label="Loading stations…" />
      ) : error ? (
        <ErrorState title="Could not load stations" message={error} onRetry={refetch} />
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--color-text-secondary)]">
          No stations in this region.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((station) => (
            <StationCard key={station.id} station={station} onOpen={setSelected} />
          ))}
        </div>
      )}

      {selected && <StationDetailModal station={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
