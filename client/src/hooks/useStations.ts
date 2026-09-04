import { useCallback, useEffect, useState } from 'react';
import { fetchStations, type Station } from '@/services/stationsApi';

export interface UseStationsResult {
  stations: Station[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Loads the station list; exposes per-section loading/error states. */
export function useStations(): UseStationsResult {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStations(await fetchStations());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { stations, loading, error, refetch: () => void load() };
}
