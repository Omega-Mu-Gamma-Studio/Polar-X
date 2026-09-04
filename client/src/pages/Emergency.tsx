import { useEffect, useMemo, useState } from 'react';
import { useEmergencyAlerts } from '@/hooks/useEmergencyAlerts';
import { useStations } from '@/hooks/useStations';
import { usePersonnel } from '@/hooks/usePersonnel';
import { resolveEmergencyAlert, type EmergencyAlert } from '@/services/emergencyApi';
import PageHeader from '@/components/common/PageHeader';
import GlassCard from '@/components/common/GlassCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/common/Button';
import { IconChevronDown, IconEmergency } from '@/components/common/Icons';
import AlertCard from '@/components/dashboard/AlertCard';
import ChecklistPanel from '@/components/dashboard/ChecklistPanel';
import EmergencyTriggerModal from '@/components/dashboard/EmergencyTriggerModal';
import { cn } from '@/utils/cn';
import { formatDateTime, timeAgo } from '@/utils/datetime';

interface ToastState {
  key: number;
  message: string;
}

export default function Emergency() {
  const { alerts, summary, loading, error, refetch, replaceAlert, addAlert } = useEmergencyAlerts();
  const { stations } = useStations();
  const { people: personnel } = usePersonnel();

  const [triggerOpen, setTriggerOpen] = useState(false);
  const [checklistAlert, setChecklistAlert] = useState<EmergencyAlert | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const activeAlerts = useMemo(() => alerts.filter((alert) => alert.status === 'active'), [alerts]);
  const resolvedAlerts = useMemo(() => alerts.filter((alert) => alert.status === 'resolved'), [alerts]);

  // Auto-dismiss toasts.
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(message: string) {
    setToast({ key: Date.now(), message });
  }

  async function resolveDirectly(alert: EmergencyAlert) {
    try {
      const updated = await resolveEmergencyAlert(alert.id);
      replaceAlert(updated);
      showToast(`Alert resolved — ${alert.alertType} at ${alert.stationName ?? 'station'}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not resolve alert');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Response"
        subtitle="One-click alerts, checklists, and evacuation coordination"
        actions={
          <Button
            variant="danger"
            size="lg"
            onClick={() => setTriggerOpen(true)}
            className="border border-[var(--color-danger-border)] shadow-[0_0_26px_rgba(255,107,107,0.4)] hover:shadow-[0_0_34px_rgba(255,107,107,0.55)]"
            icon={<IconEmergency width={17} height={17} />}
          >
            Trigger Emergency Alert
          </Button>
        }
      />

      {/* Active alerts */}
      <GlassCard padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-5 py-4">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
              Active Alerts
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {loading ? 'Loading…' : `${activeAlerts.length} active · ${summary ? `${summary.critical} critical · ${summary.warning} warning · ${summary.info} info` : ''}`}
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading alerts…" className="py-14" />
        ) : error ? (
          <div className="p-4">
            <ErrorState title="Could not load alerts" message={error} onRetry={refetch} retryLabel="Retry" />
          </div>
        ) : activeAlerts.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-[var(--color-text-secondary)]">
            No active alerts — all stations reporting nominal.
          </p>
        ) : (
          <div className="space-y-3 p-4">
            {activeAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onViewChecklist={setChecklistAlert}
                onResolve={(a) => void resolveDirectly(a)}
              />
            ))}
          </div>
        )}
      </GlassCard>

      {/* Resolved history */}
      <GlassCard padded={false} className="overflow-hidden opacity-90">
        <button
          type="button"
          onClick={() => setHistoryOpen((open) => !open)}
          aria-expanded={historyOpen}
          className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
        >
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            Resolved history · <span className="tabular-nums">{resolvedAlerts.length}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--color-text-secondary)] opacity-70">
              {resolvedAlerts.length > 0 ? `latest ${timeAgo(resolvedAlerts[0]?.timestamp)}` : ''}
            </span>
            <IconChevronDown
              width={15}
              height={15}
              className={cn('text-[var(--color-text-secondary)] transition-transform duration-200', historyOpen && 'rotate-180')}
            />
          </span>
        </button>

        {historyOpen && (
          <ul className="border-t border-white/5">
            {resolvedAlerts.length === 0 ? (
              <li className="px-5 py-6 text-center text-xs text-[var(--color-text-secondary)]">
                No resolved alerts yet.
              </li>
            ) : (
              resolvedAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-5 py-2.5 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <StatusBadge status={alert.severity} size="sm" />
                    <span className="truncate text-xs text-[var(--color-text-secondary)]">
                      {alert.alertType} · {alert.stationName ?? 'Station'}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-[11px] text-[var(--color-text-secondary)]">
                    <span>resolved {formatDateTime(alert.timestamp)}</span>
                    <StatusBadge status="resolved" size="sm" />
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </GlassCard>

      {/* Trigger modal */}
      {triggerOpen && (
        <EmergencyTriggerModal
          stations={stations}
          personnel={personnel}
          onClose={() => setTriggerOpen(false)}
          onTriggered={(alert, message) => {
            addAlert(alert);
            showToast(message);
          }}
        />
      )}

      {/* Checklist panel */}
      {checklistAlert && (
        <ChecklistPanel
          alert={checklistAlert}
          stations={stations}
          onClose={() => setChecklistAlert(null)}
          onChanged={(updated) => {
            setChecklistAlert(updated);
            replaceAlert(updated);
          }}
          onResolved={(updated, message) => {
            replaceAlert(updated);
            setChecklistAlert(null);
            showToast(message);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          key={toast.key}
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-[100] flex items-center gap-2.5 rounded-2xl border border-[var(--color-success-border)] bg-[var(--color-surface-clay)] px-4 py-3 text-sm font-medium text-[var(--color-success)] shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_18px_rgba(111,207,151,0.25)]"
        >
          <span aria-hidden className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-success)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-success)]" />
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
}