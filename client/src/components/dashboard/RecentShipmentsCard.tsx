import { Link } from 'react-router-dom';
import type { Shipment } from '@/services/cargoApi';
import GlassCard from '@/components/common/GlassCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import StatusBadge from '@/components/common/StatusBadge';
import { IconArrowRight } from '@/components/common/Icons';
import { formatDateTime } from '@/utils/datetime';

interface RecentShipmentsCardProps {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/** Latest three shipments straight from GET /api/cargo/shipments?limit=3. */
export default function RecentShipmentsCard({
  shipments,
  loading,
  error,
  onRetry,
}: RecentShipmentsCardProps) {
  const recent = shipments.slice(0, 3);

  return (
    <GlassCard padded={false} className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
            Recent Shipments
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">Latest activity across routes</p>
        </div>
        <Link
          to="/app/cargo"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[var(--color-accent)] transition-colors hover:bg-white/5 hover:underline"
        >
          View all
          <IconArrowRight width={12} height={12} />
        </Link>
      </div>

      {loading ? (
        <LoadingState label="Loading recent shipments…" className="py-10" />
      ) : error ? (
        <div className="p-4">
          <ErrorState
            title="Recent shipments unavailable"
            message={error}
            onRetry={onRetry}
            retryLabel="Retry"
          />
        </div>
      ) : recent.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[var(--color-text-secondary)]">
          No shipments recorded yet.
        </p>
      ) : (
        <ul className="flex-1 px-2 py-2">
          {recent.map((shipment, index) => (
            <li key={shipment.id}>
              <div
                className={
                  index < recent.length - 1 ? 'border-b border-white/5' : ''
                }
              >
                <Link
                  to="/app/cargo"
                  className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">
                      {shipment.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-secondary)]">
                      {shipment.origin} → {shipment.destination}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={shipment.status} size="sm" />
                    {shipment.eta && (
                      <span className="text-[10px] text-[var(--color-text-secondary)]">
                        ETA {formatDateTime(shipment.eta)}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
