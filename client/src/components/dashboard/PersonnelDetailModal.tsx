import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Personnel, PersonnelStatus } from '@/services/personnelApi';
import { fetchPerson, updatePersonnelStatus } from '@/services/personnelApi';
import Button from '@/components/common/Button';
import GlassCard from '@/components/common/GlassCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import StatusBadge from '@/components/common/StatusBadge';
import { IconMapPin, IconX } from '@/components/common/Icons';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { formatDate } from '@/utils/datetime';
import { initialsFor } from './PersonnelCard';

interface PersonnelDetailModalProps {
  person: Personnel;
  onClose: () => void;
  onSaved: (updated: Personnel) => void;
}

const STATUS_OPTIONS: Array<{ value: PersonnelStatus; label: string }> = [
  { value: 'on-duty', label: 'On Duty' },
  { value: 'in-field', label: 'In Field' },
  { value: 'at-base', label: 'At Base' },
  { value: 'on-leave', label: 'On Leave' },
];

export default function PersonnelDetailModal({ person, onClose, onSaved }: PersonnelDetailModalProps) {
  const [detail, setDetail] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const closeRef = useCallback(onClose, [onClose]);
  const containerRef = useFocusTrap(true, closeRef);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDetail(await fetchPerson(person.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load personnel record');
    } finally {
      setLoading(false);
    }
  }, [person.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeStatus(status: PersonnelStatus) {
    if (updating) return;
    setUpdating(true);
    setStatusError(null);
    try {
      const updated = await updatePersonnelStatus(person.id, status);
      setDetail(updated);
      onSaved(updated);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Could not update status');
    } finally {
      setUpdating(false);
    }
  }

  const current = detail ?? person;

  return createPortal(
    <div className="fixed inset-0 z-[85] overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${current.name} details`}
        className="relative mx-auto my-6 max-h-[calc(100vh-3rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto"
      >
        <GlassCard padded={false} className="overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aurora-soft font-display text-base font-semibold text-[var(--color-accent)] ring-1 ring-white/10">
                {initialsFor(current.name)}
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-display text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                  {current.name}
                </h2>
                <p className="truncate text-xs text-[var(--color-text-secondary)]">
                  {current.role} · {current.stationName ?? 'Unassigned'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close personnel details"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
            >
              <IconX width={18} height={18} />
            </button>
          </div>

          {loading ? (
            <LoadingState label="Loading personnel record…" className="py-12" />
          ) : error ? (
            <div className="p-6">
              <ErrorState title="Could not load record" message={error} onRetry={() => void load()} />
            </div>
          ) : (
            <div className="space-y-5 px-6 py-5">
              {/* Status control */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Status
                </p>
                <div
                  role="group"
                  aria-label="Update personnel status"
                  className="flex flex-wrap items-center gap-2"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={updating}
                      onClick={() => void changeStatus(option.value)}
                      aria-pressed={current.status === option.value}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                        current.status === option.value
                          ? 'border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] text-[var(--color-text-primary)]'
                          : 'border-[var(--color-border-glass)] bg-white/[0.03] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  <StatusBadge status={current.status} size="sm" />
                </div>
                {statusError && (
                  <p role="alert" className="mt-2 text-xs text-[var(--color-danger)]">
                    {statusError}
                  </p>
                )}
              </div>

              {/* Key facts */}
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Rotation
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-[var(--color-text-primary)]">
                    {current.rotationStart && current.rotationEnd
                      ? `${formatDate(current.rotationStart)} – ${formatDate(current.rotationEnd)}`
                      : 'Not scheduled'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Station
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-[var(--color-text-primary)]">
                    {current.stationName ?? '—'}
                  </dd>
                </div>
              </dl>

              {/* Qualifications */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Qualifications
                </p>
                {current.qualifications.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-secondary)]">None recorded.</p>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {current.qualifications.map((qual) => (
                      <li
                        key={qual}
                        className="rounded-md border border-[var(--color-border-glass)] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]"
                      >
                        {qual}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Field location map (only for in-field personnel with a position) */}
              {current.status === 'in-field' && current.currentLocation && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    <IconMapPin width={13} height={13} className="text-[var(--color-accent)]" />
                    Live field position
                  </p>
                  <div className="relative h-52 w-full overflow-hidden rounded-2xl">
                    <MapContainer
                      center={[current.currentLocation.lat, current.currentLocation.lng]}
                      zoom={9}
                      scrollWheelZoom={false}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      />
                      <Marker position={[current.currentLocation.lat, current.currentLocation.lng]}>
                        <Popup>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {current.name}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {current.currentLocation.lat.toFixed(3)}°, {current.currentLocation.lng.toFixed(3)}°
                          </p>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              )}
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