import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Station, StationDetail } from '@/services/stationsApi';
import { fetchStation } from '@/services/stationsApi';
import type { Mission } from '@/services/missionsApi';
import Button from '@/components/common/Button';
import GlassCard from '@/components/common/GlassCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import ProgressBar from '@/components/common/ProgressBar';
import StatusBadge from '@/components/common/StatusBadge';
import { IconStations, IconX } from '@/components/common/Icons';
import { stationMarkerIcon } from './CargoMap';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { formatDate } from '@/utils/datetime';

interface StationDetailModalProps {
  station: Station;
  onClose: () => void;
}

const MISSION_BADGE: Record<Mission['status'], 'info' | 'active' | 'at-base'> = {
  planned: 'info',
  active: 'active',
  completed: 'at-base',
};

function MissionRow({ mission }: { mission: Mission }) {
  const range = mission.endDate
    ? `${formatDate(mission.startDate)} – ${formatDate(mission.endDate)}`
    : `from ${formatDate(mission.startDate)}`;
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{mission.name}</p>
        <p className="text-[11px] text-[var(--color-text-secondary)]">
          {range} · {mission.personnelCount} crew · {mission.cargoCount} cargo
        </p>
      </div>
      <StatusBadge status={MISSION_BADGE[mission.status]} size="sm" label={mission.status} />
    </li>
  );
}

export default function StationDetailModal({ station, onClose }: StationDetailModalProps) {
  const [detail, setDetail] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useCallback(onClose, [onClose]);
  const containerRef = useFocusTrap(true, closeRef);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDetail(await fetchStation(station.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load station');
    } finally {
      setLoading(false);
    }
  }, [station.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasLocation = Boolean(station.location);

  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${station.name} details`}
        className="relative mx-auto my-6 max-h-[calc(100vh-3rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto"
      >
        <GlassCard padded={false} className="overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aurora-soft text-[var(--color-accent)] ring-1 ring-white/10">
                <IconStations width={20} height={20} />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                  {station.name}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {station.region} · est. {station.foundedYear}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close station details"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
            >
              <IconX width={18} height={18} />
            </button>
          </div>

          {loading ? (
            <LoadingState label="Loading station data…" className="py-12" />
          ) : error ? (
            <div className="p-6">
              <ErrorState title="Could not load station" message={error} onRetry={() => void load()} />
            </div>
          ) : (
            <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Station status
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-xs text-[var(--color-text-secondary)]">Occupancy</span>
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {detail?.personnelOnStation ?? station.personnelOnStation} / {station.capacity}
                      </span>
                    </div>
                    <ProgressBar
                      value={detail?.personnelOnStation ?? station.personnelOnStation}
                      max={station.capacity}
                      tone="accent"
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">Max berthing capacity</span>
                    <span className="font-medium text-[var(--color-text-primary)]">{station.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">Status</span>
                    <StatusBadge status={station.status === 'active' ? 'active' : 'warning'} size="sm" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Mission history
                </h3>
                {detail && detail.missions.length > 0 ? (
                  <ul>
                    {detail.missions.map((mission) => (
                      <MissionRow key={mission.id} mission={mission} />
                    ))}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">
                    No missions on record yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {hasLocation && !loading && !error && (
            <div className="border-t border-white/5">
              <div className="relative h-56 w-full overflow-hidden rounded-b-2xl">
                <MapContainer
                  center={[station.location?.lat ?? -60, station.location?.lng ?? 10]}
                  zoom={4}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  {station.location && (
                    <Marker position={[station.location.lat, station.location.lng]} icon={stationMarkerIcon}>
                      <Popup>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {station.name}
                        </p>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-white/5 px-6 py-3.5">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
}
