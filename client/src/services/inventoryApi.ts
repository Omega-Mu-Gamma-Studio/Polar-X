import api from './api';

export type InventoryStatus = 'adequate' | 'low-stock' | 'critical' | 'out-of-stock';

export interface InventoryItem {
  id: string;
  stationId: string;
  stationName?: string;
  stationRegion?: string;
  name: string;
  quantity: number;
  threshold: number;
  status: InventoryStatus;
  expiryDate: string | null;
  lastRestocked: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventorySummary {
  total: number;
  adequate: number;
  lowStock: number;
  critical: number;
  outOfStock: number;
}

export interface InventoryResponse {
  data: InventoryItem[];
  summary: InventorySummary;
}

interface FetchInventoryParams {
  stationId?: string;
  status?: InventoryStatus;
  expiringWithinDays?: number;
}

export async function fetchInventory(params: FetchInventoryParams = {}): Promise<InventoryResponse> {
  const query = new URLSearchParams();
  if (params.stationId) query.set('station_id', params.stationId);
  if (params.status) query.set('status', params.status);
  if (params.expiringWithinDays !== undefined) query.set('expiring_within_days', String(params.expiringWithinDays));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const { data } = await api.get<InventoryResponse>(`/inventory${suffix}`);
  return data;
}

export async function fetchInventoryAlerts(): Promise<InventoryItem[]> {
  const { data } = await api.get<{ data: InventoryItem[] }>('/inventory/alerts');
  return data.data;
}

export async function createInventoryItem(payload: {
  station_id: string;
  name: string;
  quantity: number;
  threshold: number;
  expiry_date?: string | null;
}): Promise<InventoryItem> {
  const { data } = await api.post<{ data: InventoryItem }>('/inventory', payload);
  return data.data;
}

export async function updateInventoryItem(
  id: string,
  payload: { name?: string; quantity?: number; threshold?: number; expiry_date?: string | null }
): Promise<InventoryItem> {
  const { data } = await api.patch<{ data: InventoryItem }>(`/inventory/${id}`, payload);
  return data.data;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await api.delete(`/inventory/${id}`);
}