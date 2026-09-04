import { useCallback, useEffect, useState } from 'react';
import {
  fetchInventory,
  type InventoryItem,
  type InventorySummary,
} from '@/services/inventoryApi';
import { onSocketEvent } from '@/services/socket';

export interface UseInventoryResult {
  items: InventoryItem[];
  summary: InventorySummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** Merge a single updated item back into local state (restock etc.). */
  replaceItem: (item: InventoryItem) => void;
}

/** Loads inventory items + summary; supports optimistic single-item updates. */
export function useInventory(): UseInventoryResult {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchInventory();
      setItems(response.data);
      setSummary(response.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Live updates: restocks from any tab merge in-place (summary recomputed from
  // the row set, so it can never drift); deletes remove the row.
  useEffect(() => {
    return onSocketEvent<InventoryItem & { deleted?: boolean }>('inventory:update', (item) => {
      if (item.deleted) {
        setItems((prev) => prev.filter((existing) => existing.id !== item.id));
        return;
      }
      setItems((prev) => {
        const next = prev.map((existing) => (existing.id === item.id ? item : existing));
        setSummary({
          total: next.length,
          adequate: next.filter((i) => i.status === 'adequate').length,
          lowStock: next.filter((i) => i.status === 'low-stock').length,
          critical: next.filter((i) => i.status === 'critical').length,
          outOfStock: next.filter((i) => i.status === 'out-of-stock').length,
        });
        return next;
      });
    });
  }, []);

  const replaceItem = useCallback((item: InventoryItem) => {
    setItems((prev) => {
      const next = prev.map((existing) => (existing.id === item.id ? item : existing));
      // Recompute the summary from the row set so it can never drift from the table.
      setSummary({
        total: next.length,
        adequate: next.filter((i) => i.status === 'adequate').length,
        lowStock: next.filter((i) => i.status === 'low-stock').length,
        critical: next.filter((i) => i.status === 'critical').length,
        outOfStock: next.filter((i) => i.status === 'out-of-stock').length,
      });
      return next;
    });
  }, []);

  return { items, summary, loading, error, refetch: () => void load(), replaceItem };
}