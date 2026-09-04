import { useMemo, useState } from 'react';
import { useShipments } from '@/hooks/useShipments';
import { useStations } from '@/hooks/useStations';
import type { ShipmentStatus } from '@/services/cargoApi';
import PageHeader from '@/components/common/PageHeader';
import GlassCard from '@/components/common/GlassCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { IconSearch, IconX } from '@/components/common/Icons';
import CargoMap, { MapLegend } from '@/components/dashboard/CargoMap';
import ShipmentTable from '@/components/dashboard/ShipmentTable';
import ShipmentDetailDrawer from '@/components/dashboard/ShipmentDetailDrawer';
import { cn } from '@/utils/cn';

type StatusFilter = 'all' | ShipmentStatus;

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'in-transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'delayed', label: 'Delayed' },
];

function StatusSegmented({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by status"
      className="flex items-center gap-1 rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] p-1"
    >
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            value === option.value
              ? 'bg-white/10 text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function Cargo() {
  const { shipments, loading, error, refetch } = useShipments();
  const {
    stations,
    loading: stationsLoading,
    error: stationsError,
    refetch: refetchStations,
  } = useStations();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const stationNames = useMemo(
    () => [...new Set(stations.map((station) => station.name))].sort(),
    [stations]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return shipments.filter((shipment) => {
      if (statusFilter !== 'all' && shipment.status !== statusFilter) return false;
      if (stationFilter !== 'all' && shipment.destination !== stationFilter) return false;
      if (query && !shipment.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [shipments, statusFilter, stationFilter, search]);

  const mapLoading = loading || stationsLoading;
  const mapError = error ?? stationsError;
  const mapRetry = () => {
    refetch();
    refetchStations();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Cargo Tracking" subtitle="Live shipment tracking across all stations" />

      {/* Filter / toolbar row */}
      <GlassCard padded={false} className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <StatusSegmented value={statusFilter} onChange={setStatusFilter} />

          <label className="sr-only" htmlFor="cargo-station-filter">
            Destination station
          </label>
          <select
            id="cargo-station-filter"
            value={stationFilter}
            onChange={(event) => setStationFilter(event.target.value)}
            className="h-10 rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent-border)]"
          >
            <option value="all">All stations</option>
            {stationNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--color-text-secondary)]">
              <IconSearch width={15} height={15} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by shipment name…"
              aria-label="Search shipments by name"
              className="h-10 w-full rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] pl-9 pr-9 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent-border)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-1 my-auto flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
              >
                <IconX width={14} height={14} />
              </button>
            )}
          </div>

          <p className="ml-auto text-xs tabular-nums text-[var(--color-text-secondary)]">
            Showing <span className="font-semibold text-[var(--color-text-primary)]">{filtered.length}</span>{' '}
            of {shipments.length}
          </p>
        </div>
      </GlassCard>

      {/* Full-size map */}
      <GlassCard padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-5 py-4">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
              Live Shipment Map
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Click a marker or route for shipment details
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-5 py-2.5">
          <MapLegend />
          <span className="hidden text-[10px] text-[var(--color-text-secondary)] opacity-70 sm:block">
            routes dashed by status
          </span>
        </div>
        {mapLoading ? (
          <div className="flex h-[440px] items-center justify-center">
            <LoadingState label="Loading shipment map…" />
          </div>
        ) : mapError ? (
          <div className="p-4">
            <ErrorState
              title="Shipment map unavailable"
              message={mapError}
              onRetry={mapRetry}
              retryLabel="Retry"
            />
          </div>
        ) : (
          <CargoMap stations={stations} shipments={filtered} className="h-[440px] w-full rounded-none" />
        )}
      </GlassCard>

      {/* Shipments table */}
      <ShipmentTable
        shipments={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        onTrack={(shipment) => setTrackingId(shipment.id)}
      />

      {trackingId && (
        <ShipmentDetailDrawer
          shipmentId={trackingId}
          stations={stations}
          onClose={() => setTrackingId(null)}
        />
      )}
    </div>
  );
}
