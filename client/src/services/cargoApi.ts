import api from './api';

export type ShipmentStatus = 'in-transit' | 'delivered' | 'delayed';

export interface ShipmentItem {
  name: string;
  quantity: number;
}

export interface ShipmentMission {
  id: string;
  name: string;
  status: string;
  stationId: string | null;
  stationName: string | null;
  stationRegion: string | null;
}

export interface Shipment {
  id: string;
  name: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  eta: string | null;
  items: ShipmentItem[];
  currentLocation: { lat: number; lng: number } | null;
  mission: ShipmentMission | null;
  createdAt: string;
  updatedAt: string;
}

interface FetchShipmentsParams {
  status?: ShipmentStatus;
  destination?: string;
  limit?: number;
}

export async function fetchShipments(params: FetchShipmentsParams = {}): Promise<Shipment[]> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.destination) query.set('destination', params.destination);
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const { data } = await api.get<{ data: Shipment[] }>(`/cargo/shipments${suffix}`);
  return data.data;
}

export async function fetchShipment(id: string): Promise<Shipment> {
  const { data } = await api.get<{ data: Shipment }>(`/cargo/shipments/${id}`);
  return data.data;
}

export async function trackShipment(id: string): Promise<Shipment> {
  const { data } = await api.get<{ data: Shipment }>(`/cargo/shipments/${id}/track`);
  return data.data;
}

export async function createShipment(payload: {
  name: string;
  origin: string;
  destination: string;
  mission_id?: string | null;
  status?: ShipmentStatus;
  eta?: string | null;
  items?: ShipmentItem[];
  current_location?: { lat: number; lng: number };
}): Promise<Shipment> {
  const { data } = await api.post<{ data: Shipment }>('/cargo/shipments', payload);
  return data.data;
}

export async function updateShipmentStatus(
  id: string,
  payload: { status: ShipmentStatus; current_location?: { lat: number; lng: number } }
): Promise<Shipment> {
  const { data } = await api.patch<{ data: Shipment }>(`/cargo/shipments/${id}/status`, payload);
  return data.data;
}
