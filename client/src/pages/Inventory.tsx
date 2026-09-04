import { useEffect, useMemo, useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import type { InventoryStatus } from '@/services/inventoryApi';
import PageHeader from '@/components/common/PageHeader';
import GlassCard from '@/components/common/GlassCard';
import ErrorState from '@/components/common/ErrorState';
import StatCard from '@/components/common/StatCard';
import { IconBox, IconInventory, IconSearch, IconX } from '@/components/common/Icons';
import InventoryTable from '@/components/dashboard/InventoryTable';
import RestockModal from '@/components/dashboard/RestockModal';
import InventoryAlertBanner from '@/components/dashboard/InventoryAlertBanner';
import { cn } from '@/utils/cn';

type StatusFilter = 'all' | InventoryStatus;

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'adequate', label: 'Adequate' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'critical', label: 'Critical' },
  { value: 'out-of-stock', label: 'Out of Stock' },
];

export default function Inventory() {
  const { items, summary, loading, error, refetch, replaceItem } = useInventory();

  const [stationFilter, setStationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [restockItem, setRestockItem] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const stations = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      if (item.stationName) map.set(item.stationId, item.stationName);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (stationFilter !== 'all' && item.stationId !== stationFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (query && !item.name.toLowerCase().includes(query)) return false;
      if (expiringOnly) {
        if (!item.expiryDate) return false;
        const days = Math.ceil((new Date(`${item.expiryDate}T00:00:00`).getTime() - Date.now()) / 86_400_000);
        if (days > 30) return false;
      }
      return true;
    });
  }, [items, stationFilter, statusFilter, expiringOnly, search]);

  // Jump from the alert banner: reset filters so the row is visible, then
  // scroll to it and flash it briefly.
  useEffect(() => {
    if (!highlightId) return;
    setStationFilter('all');
    setStatusFilter('all');
    setExpiringOnly(false);
    setSearch('');
    const timer = window.setTimeout(() => {
      document.getElementById(`inv-row-${highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
    const clear = window.setTimeout(() => setHighlightId(null), 2800);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(clear);
    };
  }, [highlightId]);

  const restockTarget = restockItem ? items.find((item) => item.id === restockItem) ?? null : null;
  const attentionCount = summary ? summary.critical + summary.outOfStock : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" subtitle="Stock levels across all stations" />

      {/* Summary strip */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[88px] animate-pulse rounded-[20px] bg-white/[0.04]" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Could not load inventory" message={error} onRetry={refetch} retryLabel="Retry" />
      ) : summary ? (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            icon={<IconInventory width={18} height={18} />}
            label="Total items"
            value={summary.total}
            hint="across all stations"
          />
          <StatCard
            icon={<IconBox width={18} height={18} />}
            label="Adequate"
            value={summary.adequate}
            tone="success"
          />
          <StatCard
            icon={<IconBox width={18} height={18} />}
            label="Low stock"
            value={summary.lowStock}
            tone="warning"
          />
          <StatCard
            icon={<IconBox width={18} height={18} />}
            label="Critical + out"
            value={attentionCount ?? 0}
            tone="danger"
            hint={
              summary.critical > 0 || summary.outOfStock > 0
                ? `${summary.critical} critical · ${summary.outOfStock} out`
                : undefined
            }
          />
        </div>
      ) : null}

      {/* Alert banner (own fetch, independent state) */}
      <InventoryAlertBanner onJump={(id) => setHighlightId(id)} />

      {/* Filter / toolbar row */}
      <GlassCard padded={false} className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="inventory-station-filter">
            Station
          </label>
          <select
            id="inventory-station-filter"
            value={stationFilter}
            onChange={(event) => setStationFilter(event.target.value)}
            className="h-10 rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent-border)]"
          >
            <option value="all">All stations</option>
            {stations.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="inventory-status-filter">
            Status
          </label>
          <select
            id="inventory-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="h-10 rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent-border)]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] px-3 py-2.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]">
            <input
              type="checkbox"
              checked={expiringOnly}
              onChange={(event) => setExpiringOnly(event.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] accent-[var(--color-warning)]"
            />
            Expiring within 30 days
          </label>

          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--color-text-secondary)]">
              <IconSearch width={15} height={15} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by item name…"
              aria-label="Search inventory by name"
              className="h-10 w-full rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] pl-9 pr-9 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent-border)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-1 my-auto flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
              >
                <IconX width={14} height={14} />
              </button>
            )}
          </div>

          <p className={cn('ml-auto text-xs tabular-nums text-[var(--color-text-secondary)]')}>
            Showing <span className="font-semibold text-[var(--color-text-primary)]">{filtered.length}</span> of{' '}
            {items.length}
          </p>
        </div>
      </GlassCard>

      {/* Table */}
      <InventoryTable
        items={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        onRestock={(item) => setRestockItem(item.id)}
        highlightId={highlightId}
      />

      {restockTarget && (
        <RestockModal
          item={restockTarget}
          onClose={() => setRestockItem(null)}
          onSaved={replaceItem}
        />
      )}
    </div>
  );
}