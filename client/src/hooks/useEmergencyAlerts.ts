import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchEmergencyAlerts,
  type EmergencyAlert,
  type EmergencySummary,
  type Severity,
} from '@/services/emergencyApi';
import { onSocketEvent } from '@/services/socket';

export interface UseEmergencyAlertsResult {
  alerts: EmergencyAlert[];
  summary: EmergencySummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** Merge a single updated alert (checklist/resolve) back into state. */
  replaceAlert: (alert: EmergencyAlert) => void;
  /** Prepend a freshly-triggered alert (keeps it at the top of the active list). */
  addAlert: (alert: EmergencyAlert) => void;
}

function computeSummary(alerts: EmergencyAlert[]): EmergencySummary {
  const activeRows = alerts.filter((a) => a.status === 'active');
  return {
    active: activeRows.length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
    critical: activeRows.filter((a) => a.severity === 'critical').length,
    warning: activeRows.filter((a) => a.severity === 'warning').length,
    info: activeRows.filter((a) => a.severity === 'info').length,
  };
}

/** Loads emergency alerts; keeps summary derived from the local row set. */
export function useEmergencyAlerts(): UseEmergencyAlertsResult {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [summary, setSummary] = useState<EmergencySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchEmergencyAlerts();
      setAlerts(response.data);
      setSummary(response.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const replaceAlert = useCallback((alert: EmergencyAlert) => {
    setAlerts((prev) => {
      const next = prev.map((existing) => (existing.id === alert.id ? alert : existing));
      setSummary(computeSummary(next));
      return next;
    });
  }, []);

  const addAlert = useCallback((alert: EmergencyAlert) => {
    setAlerts((prev) => {
      const next = [alert, ...prev];
      setSummary(computeSummary(next));
      return next;
    });
  }, []);

  // Stable refs so the one-time socket subscription always calls the latest
  // callbacks without re-subscribing on every render.
  const addAlertRef = useRef(addAlert);
  const replaceAlertRef = useRef(replaceAlert);

  // Live updates: a new alert lands on top; checklist/resolve changes merge
  // in place. Both recompute the summary from the local row set.
  useEffect(() => {
    const offNew = onSocketEvent<EmergencyAlert>('alert:new', (alert) => {
      addAlertRef.current(alert);
    });
    const offUpdate = onSocketEvent<EmergencyAlert>('alert:update', (alert) => {
      replaceAlertRef.current(alert);
    });
    return () => {
      offNew();
      offUpdate();
    };
  }, []);

  return { alerts, summary, loading, error, refetch: () => void load(), replaceAlert, addAlert };
}

// Keep Severity import referenced for consumers that only import the hook.
export type { Severity };