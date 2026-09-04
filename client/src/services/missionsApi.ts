import api from './api';

export type MissionStatus = 'planned' | 'active' | 'completed';

export interface Mission {
  id: string;
  name: string;
  stationId: string;
  startDate: string;
  endDate: string | null;
  status: MissionStatus;
  personnelCount: number;
  cargoCount: number;
  createdAt: string;
  updatedAt: string;
  station: { id: string; name: string; region: string } | null;
}

interface FetchMissionsParams {
  stationId?: string;
  status?: MissionStatus;
}

export async function fetchMissions(params: FetchMissionsParams = {}): Promise<Mission[]> {
  const query = new URLSearchParams();
  if (params.stationId) query.set('station_id', params.stationId);
  if (params.status) query.set('status', params.status);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const { data } = await api.get<{ data: Mission[] }>(`/missions${suffix}`);
  return data.data;
}

export async function createMission(payload: {
  name: string;
  station_id: string;
  start_date: string;
  end_date?: string | null;
  status?: MissionStatus;
  personnel_count?: number;
  cargo_count?: number;
}): Promise<Mission> {
  const { data } = await api.post<{ data: Mission }>('/missions', payload);
  return data.data;
}
