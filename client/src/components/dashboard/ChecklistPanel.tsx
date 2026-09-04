import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import type { EmergencyAlert } from '@/services/emergencyApi';
import type { Station } from '@/services/stationsApi';
import { resolveEmergencyAlert, updateAlertChecklist } from '@/services/emergencyApi';
import Button from '@/components/common/Button';
import GlassCard from '@/components/common/GlassCard';
import ProgressBar from '@/components/common/ProgressBar';
import StatusBadge from '@/components/common/StatusBadge';
import { IconCheck, IconX } from '@/components/common/Icons';
import EvacuationMap from './EvacuationMap';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { timeAgo } from '@/utils/datetime';

interface ChecklistPanelProps {
  alert: EmergencyAlert;
  stations: Station[];
  onClose: () => void;
  onChanged: (updated: EmergencyAlert) => void;
  onResolved: (updated: EmergencyAlert, message: string) => void;
}

export default function ChecklistPanel({
  alert,
  stations,
  onClose,
  onChanged,
  onResolved,
}: ChecklistPanelProps) {
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useCallback(onClose, [onClose]);
  const containerRef = useFocusTrap(true, closeRef);

  const station = stations.find((s) => s.id === alert.stationId) ?? null;
  const done = alert.checklistItems.filter((item) => item.completed).length;

  async function toggle(itemId: string, completed: boolean) {
    if (busyItem) return;
    setBusyItem(itemId);
    setError(null);
    try {
      const updated = await updateAlertChecklist(alert.id, itemId, completed);
      onChanged(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update checklist');
    } finally {
      setBusyItem(null);
    }
  }

  async function resolve() {
    if (!alert.checklistCompleted || resolving) return;
    setResolving(true);
    setError(null);
    try {
      const updated = await resolveEmergencyAlert(alert.id);
      onResolved(updated, `Alert resolved — ${alert.alertType} at ${alert.stationName ?? 'station'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resolve alert');
    } finally {
      setResolving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Checklist for ${alert.alertType} alert`}
        className="relative mx-auto my-6 max-h-[calc(100vh-3rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto"
      >
        <GlassCard padded={false} className="overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                Response checklist
              </p>
              <h2 className="mt-1 truncate font-display text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                {alert.alertType} · {alert.stationName ?? 'Station'}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                {timeAgo(alert.timestamp)} · severity{' '}
                <span className="font-medium text-[var(--color-text-primary)]">{alert.severity}</span>
                {alert.triggeredByName ? ` · by ${alert.triggeredByName}` : ''}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge status={alert.severity} size="sm" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close checklist"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
              >
                <IconX width={18} height={18} />
              </button>
            </div>
          </div>

          <div className="space-y-5 px-6 py-5">
            {alert.description && (
              <p className="rounded-xl border border-[var(--color-border-glass)] bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {alert.description}
              </p>
            )}

            {/* Progress */}
            <div>
              <ProgressBar
                value={done}
                max={Math.max(1, alert.checklistItems.length)}
                tone={alert.checklistCompleted ? 'success' : 'accent'}
                label="Checklist progress"
                showValue
              />
              {alert.checklistCompleted && (
                <p className="mt-2 text-xs font-medium text-[var(--color-success)]">
                  All items complete — this alert can now be resolved.
                </p>
              )}
            </div>

            {/* Items */}
            <ul className="space-y-2">
              {alert.checklistItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={busyItem !== null}
                    onClick={() => void toggle(item.id, !item.completed)}
                    aria-pressed={item.completed}
                    className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border-glass)] bg-white/[0.02] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.05] disabled:opacity-60"
                  >
                    <span
                      aria-hidden
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        item.completed
                          ? 'border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                          : 'border-white/20 bg-white/[0.03] text-transparent'
                      }`}
                    >
                      <IconCheck width={12} height={12} />
                    </span>
                    <span
                      className={`text-sm ${item.completed ? 'text-[var(--color-text-secondary)] line-through decoration-white/30' : 'text-[var(--color-text-primary)]'}`}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Evacuation route */}
            {station?.location && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Evacuation route
                </p>
                <EvacuationMap station={station} className="relative h-52 w-full overflow-hidden rounded-2xl" />
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-3 py-2 text-xs text-[var(--color-danger)]">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-white/5 px-6 py-3.5">
            <p className="text-[11px] text-[var(--color-text-secondary)] opacity-80">
              {alert.checklistCompleted
                ? 'Checklist complete — resolution enabled'
                : 'Resolve is unlocked when every item is checked'}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!alert.checklistCompleted || resolving}
                onClick={() => void resolve()}
              >
                {resolving ? 'Resolving…' : 'Resolve Alert'}
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
}