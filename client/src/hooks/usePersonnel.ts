import { useCallback, useEffect, useState } from 'react';
import { fetchPersonnel, type Personnel, type PersonnelSummary } from '@/services/personnelApi';
import { onSocketEvent } from '@/services/socket';

export interface UsePersonnelResult {
  people: Personnel[];
  summary: PersonnelSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** Merge a single updated record back into local state (status changes etc.). */
  replacePerson: (person: Personnel) => void;
}

/** Loads the personnel roster; supports optimistic single-record updates. */
export function usePersonnel(): UsePersonnelResult {
  const [people, setPeople] = useState<Personnel[]>([]);
  const [summary, setSummary] = useState<PersonnelSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPersonnel();
      setPeople(response.data);
      setSummary(response.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load personnel');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Live updates: status / field-location changes from any tab merge in-place.
  useEffect(() => {
    return onSocketEvent<Personnel>('personnel:update', (person) => {
      setPeople((prev) => {
        const next = prev.map((existing) => (existing.id === person.id ? person : existing));
        setSummary({
          total: next.length,
          onDuty: next.filter((p) => p.status === 'on-duty').length,
          inField: next.filter((p) => p.status === 'in-field').length,
          atBase: next.filter((p) => p.status === 'at-base').length,
          onLeave: next.filter((p) => p.status === 'on-leave').length,
        });
        return next;
      });
    });
  }, []);

  const replacePerson = useCallback((person: Personnel) => {
    setPeople((prev) => {
      const next = prev.map((existing) => (existing.id === person.id ? person : existing));
      setSummary({
        total: next.length,
        onDuty: next.filter((p) => p.status === 'on-duty').length,
        inField: next.filter((p) => p.status === 'in-field').length,
        atBase: next.filter((p) => p.status === 'at-base').length,
        onLeave: next.filter((p) => p.status === 'on-leave').length,
      });
      return next;
    });
  }, []);

  return { people, summary, loading, error, refetch: () => void load(), replacePerson };
}