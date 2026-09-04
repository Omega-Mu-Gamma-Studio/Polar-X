import api from './api';
import type { Mission } from './missionsApi';

export type StationRegion = 'Antarctica' | 'Arctic';

export interface Station {
  id: string;
  name: string;
  region: StationRegion;
  location: { lat: number; lng: number } | null;
  capacity: number;
  personnelOnStation: number;
  status: 'active' | 'inactive';
  foundedYear: number;
  createdAt: string;
  updatedAt: string;
}

export interface StationDetail extends Station {
  missions: Mission[];
}

export async function fetchStations(): Promise<Station[]> {
  const { data } = await api.get<{ data: Station[] }>('/stations');
  return data.data;
}

export async function fetchStation(id: string): Promise<StationDetail> {
  const { data } = await api.get<{ data: StationDetail }>(`/stations/${id}`);
  return data.data;
}
