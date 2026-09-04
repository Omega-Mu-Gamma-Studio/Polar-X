import { useCallback, useEffect, useState } from 'react';
import { fetchShipments, type Shipment, type ShipmentStatus } from '@/services/cargoApi';
import { onSocketEvent } from '@/services/socket';

interface UseShipmentsOptions {
  status?: ShipmentStatus;
  limit?: number;
}

export interface UseShipmentsResult {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useShipments(options: UseShipmentsOptions = {}): UseShipmentsResult {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setShipments(await fetchShipments({ status: options.status, limit: options.limit }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  }, [options.status, options.limit]);

  useEffect(() => {
    void load();
  }, [load]);

  // Live updates: a status/location change elsewhere (or another tab) replaces
  // the shipment in place so the map + list stay current without a refresh.
  useEffect(() => {
    return onSocketEvent<Shipment>('shipment:update', (updated) => {
      setShipments((prev) => {
        const exists = prev.some((s) => s.id === updated.id);
        return exists ? prev.map((s) => (s.id === updated.id ? updated : s)) : [updated, ...prev];
      });
    });
  }, []);

  return { shipments, loading, error, refetch: () => void load() };
}
