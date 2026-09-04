import { useCallback, useEffect, useState } from 'react';
import { fetchMissions, type Mission, type MissionStatus } from '@/services/missionsApi';

interface UseMissionsOptions {
  stationId?: string;
  status?: MissionStatus;
}

export interface UseMissionsResult {
  missions: Mission[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMissions(options: UseMissionsOptions = {}): UseMissionsResult {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMissions(await fetchMissions(options));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load missions');
    } finally {
      setLoading(false);
    }
  }, [options.stationId, options.status]);

  useEffect(() => {
    void load();
  }, [load]);

  return { missions, loading, error, refetch: () => void load() };
}
