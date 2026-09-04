import api from './api';

export type PersonnelStatus = 'on-duty' | 'in-field' | 'at-base' | 'on-leave';

export interface Personnel {
  id: string;
  name: string;
  role: string;
  stationId: string | null;
  stationName?: string;
  stationRegion?: string;
  qualifications: string[];
  rotationStart: string | null;
  rotationEnd: string | null;
  currentLocation: { lat: number; lng: number } | null;
  status: PersonnelStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PersonnelSummary {
  total: number;
  onDuty: number;
  inField: number;
  atBase: number;
  onLeave: number;
}

export interface PersonnelResponse {
  data: Personnel[];
  summary: PersonnelSummary;
}

interface FetchPersonnelParams {
  stationId?: string;
  status?: PersonnelStatus;
  role?: string;
}

export async function fetchPersonnel(params: FetchPersonnelParams = {}): Promise<PersonnelResponse> {
  const query = new URLSearchParams();
  if (params.stationId) query.set('station_id', params.stationId);
  if (params.status) query.set('status', params.status);
  if (params.role) query.set('role', params.role);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const { data } = await api.get<PersonnelResponse>(`/personnel${suffix}`);
  return data;
}

export async function fetchPerson(id: string): Promise<Personnel> {
  const { data } = await api.get<{ data: Personnel }>(`/personnel/${id}`);
  return data.data;
}

export async function createPersonnel(payload: {
  name: string;
  role: string;
  station_id: string;
  rotation_start: string;
  rotation_end?: string | null;
  qualifications?: string[];
  status?: PersonnelStatus;
  current_location?: { lat: number; lng: number } | null;
}): Promise<Personnel> {
  const { data } = await api.post<{ data: Personnel }>('/personnel', payload);
  return data.data;
}

export async function updatePersonnelStatus(id: string, status: PersonnelStatus): Promise<Personnel> {
  const { data } = await api.patch<{ data: Personnel }>(`/personnel/${id}/status`, { status });
  return data.data;
}

export async function updatePersonnelLocation(
  id: string,
  currentLocation: { lat: number; lng: number } | null
): Promise<Personnel> {
  const { data } = await api.patch<{ data: Personnel }>(`/personnel/${id}/location`, {
    current_location: currentLocation,
  });
  return data.data;
}