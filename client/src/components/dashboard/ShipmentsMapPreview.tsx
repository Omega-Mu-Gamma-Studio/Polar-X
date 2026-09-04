import { Link } from 'react-router-dom';
import type { Station } from '@/services/stationsApi';
import type { Shipment } from '@/services/cargoApi';
import GlassCard from '@/components/common/GlassCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { IconArrowRight } from '@/components/common/Icons';
import CargoMap, { MapLegend } from './CargoMap';

interface ShipmentsMapPreviewProps {
  stations: Station[];
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/** Dashboard map card — live shipment routes via the shared CargoMap. */
export default function ShipmentsMapPreview({
  stations,
  shipments,
  loading,
  error,
  onRetry,
}: ShipmentsMapPreviewProps) {
  return (
    <GlassCard padded={false} className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
            Active Shipments Map
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Live polar routes — dashed lines by status
          </p>
        </div>
        <Link
          to="/app/cargo"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[var(--color-accent)] transition-colors hover:bg-white/5 hover:underline"
        >
          Open cargo tracker
          <IconArrowRight width={13} height={13} />
        </Link>
      </div>

      <div className="border-b border-white/5 px-5 py-2.5">
        <MapLegend />
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingState label="Loading shipment map…" />
        </div>
      ) : error ? (
        <div className="p-4">
          <ErrorState
            title="Shipment map unavailable"
            message={error}
            onRetry={onRetry}
            retryLabel="Retry"
          />
        </div>
      ) : (
        <CargoMap stations={stations} shipments={shipments} className="h-[360px] w-full rounded-none" />
      )}
    </GlassCard>
  );
}
