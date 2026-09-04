import api from './api';

export type AlertType = 'Medical' | 'Fire' | 'Weather' | 'Equipment Failure' | 'Other';
export type Severity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'resolved';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface EmergencyAlert {
  id: string;
  alertType: AlertType;
  description: string | null;
  severity: Severity;
  stationId: string;
  stationName?: string;
  stationRegion?: string;
  location: { lat: number; lng: number } | null;
  timestamp: string;
  status: AlertStatus;
  checklistItems: ChecklistItem[];
  checklistCompleted: boolean;
  triggeredById: string | null;
  triggeredByName?: string;
  triggeredByRole?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencySummary {
  active: number;
  critical: number;
  warning: number;
  info: number;
  resolved: number;
}

export interface EmergencyResponse {
  data: EmergencyAlert[];
  summary: EmergencySummary;
}

interface FetchAlertsParams {
  status?: AlertStatus;
  severity?: Severity;
}

export async function fetchEmergencyAlerts(params: FetchAlertsParams = {}): Promise<EmergencyResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.severity) query.set('severity', params.severity);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const { data } = await api.get<EmergencyResponse>(`/emergency/alerts${suffix}`);
  return data;
}

export async function fetchEmergencyAlert(id: string): Promise<EmergencyAlert> {
  const { data } = await api.get<{ data: EmergencyAlert }>(`/emergency/alerts/${id}`);
  return data.data;
}

export async function triggerEmergencyAlert(payload: {
  alert_type: AlertType;
  station_id: string;
  triggered_by?: string | null;
  description?: string;
  severity?: Severity;
}): Promise<EmergencyAlert> {
  const { data } = await api.post<{ data: EmergencyAlert }>('/emergency/trigger', payload);
  return data.data;
}

export async function updateAlertChecklist(
  id: string,
  itemId: string,
  completed: boolean
): Promise<EmergencyAlert> {
  const { data } = await api.patch<{ data: EmergencyAlert }>(`/emergency/alerts/${id}/checklist`, {
    item_id: itemId,
    completed,
  });
  return data.data;
}

export async function resolveEmergencyAlert(id: string): Promise<EmergencyAlert> {
  const { data } = await api.patch<{ data: EmergencyAlert }>(`/emergency/alerts/${id}/resolve`);
  return data.data;
}