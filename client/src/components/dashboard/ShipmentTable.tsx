import { useMemo, useState } from 'react';
import type { Shipment } from '@/services/cargoApi';
import Button from '@/components/common/Button';
import GlassCard from '@/components/common/GlassCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import StatusBadge from '@/components/common/StatusBadge';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/datetime';

type SortKey = 'eta' | 'status' | null;
type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<Shipment['status'], number> = {
  'in-transit': 0,
  delayed: 1,
  delivered: 2,
};

interface ShipmentTableProps {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onTrack: (shipment: Shipment) => void;
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:text-[var(--color-text-primary)]',
        active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'
      )}
    >
      {label}
      <span aria-hidden className="text-[9px] leading-none">
        {active ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
      </span>
    </button>
  );
}

export default function ShipmentTable({
  shipments,
  loading,
  error,
  onRetry,
  onTrack,
}: ShipmentTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function toggleSort(key: Exclude<SortKey, null>) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return shipments;
    const factor = sortDir === 'asc' ? 1 : -1;
    return [...shipments].sort((a, b) => {
      if (sortKey === 'status') {
        return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * factor;
      }
      // eta — nulls always sort last
      if (!a.eta && !b.eta) return 0;
      if (!a.eta) return 1;
      if (!b.eta) return -1;
      return (new Date(a.eta).getTime() - new Date(b.eta).getTime()) * factor;
    });
  }, [shipments, sortKey, sortDir]);

  const now = Date.now();

  return (
    <GlassCard padded={false} className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
            All Shipments
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {shipments.length} route{shipments.length === 1 ? '' : 's'} · click Track for the full route view
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SortableHeader
            label="Sort · Status"
            active={sortKey === 'status'}
            dir={sortDir}
            onClick={() => toggleSort('status')}
          />
          <SortableHeader
            label="ETA"
            active={sortKey === 'eta'}
            dir={sortDir}
            onClick={() => toggleSort('eta')}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading shipments…" className="py-14" />
      ) : error ? (
        <div className="p-4">
          <ErrorState
            title="Could not load shipments"
            message={error}
            onRetry={onRetry}
            retryLabel="Retry"
          />
        </div>
      ) : sorted.length === 0 ? (
        <p className="px-5 py-14 text-center text-sm text-[var(--color-text-secondary)]">
          No shipments match the current filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <caption className="sr-only">Shipments list</caption>
            <tbody>
              {sorted.map((shipment) => {
                const overdue =
                  shipment.status !== 'delivered' && shipment.eta && new Date(shipment.eta).getTime() < now;
                return (
                  <tr
                    key={shipment.id}
                    className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-3.5">
                      <p className="max-w-[260px] truncate font-medium text-[var(--color-text-primary)]">
                        {shipment.name}
                      </p>
                      {shipment.mission?.name && (
                        <p className="max-w-[260px] truncate text-[11px] text-[var(--color-text-secondary)]">
                          {shipment.mission.name}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="max-w-[200px] truncate text-xs text-[var(--color-text-secondary)]">
                        {shipment.origin} <span className="text-[var(--color-accent)]">→</span>{' '}
                        {shipment.destination}
                      </p>
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={shipment.status} size="sm" />
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          'whitespace-nowrap text-xs tabular-nums',
                          overdue ? 'font-medium text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]'
                        )}
                      >
                        {shipment.eta ? formatDate(shipment.eta) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onTrack(shipment)}
                        aria-label={`Track ${shipment.name}`}
                      >
                        Track
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
