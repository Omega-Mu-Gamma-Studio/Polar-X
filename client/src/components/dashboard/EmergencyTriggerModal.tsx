import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AlertType, EmergencyAlert, Severity } from '@/services/emergencyApi';
import { triggerEmergencyAlert } from '@/services/emergencyApi';
import type { Personnel } from '@/services/personnelApi';
import type { Station } from '@/services/stationsApi';
import Button from '@/components/common/Button';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import { IconEmergency, IconX } from '@/components/common/Icons';
import { useFocusTrap } from '@/hooks/useFocusTrap';

const ALERT_TYPES: AlertType[] = ['Medical', 'Fire', 'Weather', 'Equipment Failure', 'Other'];

// The server derives a default severity per type; show it as a hint so the
// operator knows what they are triggering.
const SEVERITY_HINT: Record<AlertType, Severity> = {
  Medical: 'critical',
  Fire: 'critical',
  Weather: 'warning',
  'Equipment Failure': 'warning',
  Other: 'info',
};

interface EmergencyTriggerModalProps {
  stations: Station[];
  personnel: Personnel[];
  onClose: () => void;
  onTriggered: (alert: EmergencyAlert, message: string) => void;
}

export default function EmergencyTriggerModal({
  stations,
  personnel,
  onClose,
  onTriggered,
}: EmergencyTriggerModalProps) {
  const [alertType, setAlertType] = useState<AlertType>('Medical');
  const [stationId, setStationId] = useState<string>(stations[0]?.id ?? '');
  const [triggeredBy, setTriggeredBy] = useState<string>(personnel[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useCallback(onClose, [onClose]);
  const containerRef = useFocusTrap(true, closeRef);

  // Reset the draft whenever the modal is reopened.
  useEffect(() => {
    setAlertType('Medical');
    setStationId(stations[0]?.id ?? '');
    setTriggeredBy(personnel[0]?.id ?? '');
    setDescription('');
    setError(null);
  }, [stations, personnel]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!stationId) return;
    setSubmitting(true);
    setError(null);
    try {
      const alert = await triggerEmergencyAlert({
        alert_type: alertType,
        station_id: stationId,
        triggered_by: triggeredBy || null,
        description: description.trim() || undefined,
      });
      onTriggered(alert, 'MoES Headquarters notified');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not trigger alert');
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close alert trigger"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Trigger emergency alert"
        className="relative w-full max-w-lg"
      >
        <GlassCard padded={false} className="overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] shadow-[0_0_18px_rgba(255,107,107,0.35)]">
                <IconEmergency width={20} height={20} />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                  Trigger Emergency Alert
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Creates an alert with a type-specific response checklist
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close alert trigger"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
            >
              <IconX width={18} height={18} />
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4 px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="alert-type" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Alert type
                </label>
                <select
                  id="alert-type"
                  value={alertType}
                  onChange={(event) => setAlertType(event.target.value as AlertType)}
                  className="h-11 w-full rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent-border)]"
                >
                  {ALERT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
                  Default severity{' '}
                  <StatusBadge status={SEVERITY_HINT[alertType]} size="sm" label={SEVERITY_HINT[alertType]} />
                </p>
              </div>

              <div>
                <label htmlFor="alert-station" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Station
                </label>
                <select
                  id="alert-station"
                  value={stationId}
                  onChange={(event) => setStationId(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent-border)]"
                >
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} — {station.region}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="alert-triggered-by" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                Triggered by
              </label>
              {/* Phase 7 note: this dropdown becomes the current logged-in user
                  automatically once JWT auth exists; it is a personnel picker
                  only because there are no auth accounts yet. */}
              <select
                id="alert-triggered-by"
                value={triggeredBy}
                onChange={(event) => setTriggeredBy(event.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent-border)]"
              >
                <option value="">System (no person)</option>
                {personnel.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} — {person.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="alert-description" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                Description <span className="text-[var(--color-text-secondary)] opacity-60">(optional)</span>
              </label>
              <textarea
                id="alert-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="What happened? Who is affected?"
                className="w-full resize-none rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent-border)]"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-3 py-2 text-xs text-[var(--color-danger)]">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-[var(--color-text-secondary)] opacity-80">
                MoES HQ auto-notification (simulated)
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="md" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="danger" size="md" type="submit" disabled={!stationId || submitting}>
                  {submitting ? 'Triggering…' : '🚨 Trigger Alert'}
                </Button>
              </div>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
}