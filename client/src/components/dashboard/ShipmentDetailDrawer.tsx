import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Station } from '@/services/stationsApi';
import { trackShipment, type Shipment } from '@/services/cargoApi';
import Button from '@/components/common/Button';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import StatusBadge from '@/components/common/StatusBadge';
import { IconX } from '@/components/common/Icons';
import CargoMap from './CargoMap';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { formatDateTime, timeAgo } from '@/utils/datetime';

interface ShipmentDetailDrawerProps {
  shipmentId: string;
  stations: Station[];
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-[var(--color-text-primary)]">{value}</dd>
    </div>
  );
}

export default function ShipmentDetailDrawer({
  shipmentId,
  stations,
  onClose,
}: ShipmentDetailDrawerProps) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onCloseStable = useCallback(onClose, [onClose]);
  const containerRef = useFocusTrap(true, onCloseStable);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setShipment(await trackShipment(shipmentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipment');
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Close tracking view"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={shipment ? `Tracking ${shipment.name}` : 'Tracking shipment'}
        className="polar-glass absolute inset-y-0 right-0 flex w-full max-w-[540px] flex-col rounded-l-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
              Shipment tracking
            </p>
            {shipment && (
              <h2 className="mt-1 flex flex-wrap items-center gap-2.5 pr-2 font-display text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                <span className="truncate">{shipment.name}</span>
                <StatusBadge status={shipment.status} size="sm" />
              </h2>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tracking view"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
          >
            <IconX width={18} height={18} />
          </button>
        </div>

        {loading ? (
          <LoadingState label="Loading shipment…" className="flex-1" />
        ) : error || !shipment ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <ErrorState
              title="Could not load shipment"
              message={error ?? 'Shipment unavailable'}
              onRetry={() => void load()}
              retryLabel="Retry"
            />
          </div>
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {/* Route summary */}
            <div className="rounded-2xl border border-[var(--color-border-glass)] bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Origin
                  </p>
                  <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {shipment.origin}
                  </p>
                </div>
                <span aria-hidden className="shrink-0 text-[var(--color-accent)]">
                  ──▶
                </span>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Destination
                  </p>
                  <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {shipment.destination}
                  </p>
                </div>
              </div>
            </div>

            {/* Key facts */}
            <dl className="grid grid-cols-2 gap-4">
              <InfoRow label="ETA" value={shipment.eta ? formatDateTime(shipment.eta) : 'Not scheduled'} />
              <InfoRow
                label="Mission"
                value={shipment.mission?.name ?? 'Independent shipment'}
              />
              <InfoRow
                label="Mission station"
                value={shipment.mission?.stationName ?? '—'}
              />
              <InfoRow label="Last update" value={timeAgo(shipment.updatedAt)} />
            </dl>

            {/* Route map */}
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Route view
              </h3>
              <CargoMap
                stations={stations}
                shipments={[shipment]}
                fitShipmentOnly
                className="h-56 w-full rounded-2xl"
              />
            </div>

            {/* Manifest */}
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Manifest · {shipment.items.length} line{shipment.items.length === 1 ? '' : 's'}
              </h3>
              {shipment.items.length === 0 ? (
                <p className="rounded-xl border border-[var(--color-border-glass)] bg-white/[0.02] px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
                  No line items recorded.
                </p>
              ) : (
                <ul className="overflow-hidden rounded-xl border border-[var(--color-border-glass)] bg-white/[0.02]">
                  {shipment.items.map((item, index) => (
                    <li
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2.5 text-sm last:border-0"
                    >
                      <span className="truncate text-[var(--color-text-primary)]">{item.name}</span>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-[var(--color-accent)]">
                        {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/5 px-5 py-3.5">
          <p className="text-[11px] text-[var(--color-text-secondary)] opacity-80">
            {shipment?.currentLocation
              ? `Position ${shipment.currentLocation.lat.toFixed(2)}°, ${shipment.currentLocation.lng.toFixed(2)}°`
              : 'Position not broadcast'}
          </p>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
