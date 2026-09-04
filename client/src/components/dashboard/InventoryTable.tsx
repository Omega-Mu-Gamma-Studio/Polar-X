import type { InventoryItem } from '@/services/inventoryApi';
import Button from '@/components/common/Button';
import GlassCard from '@/components/common/GlassCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import ProgressBar from '@/components/common/ProgressBar';
import StatusBadge from '@/components/common/StatusBadge';
import { cn } from '@/utils/cn';
import { timeAgo } from '@/utils/datetime';

interface InventoryTableProps {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onRestock: (item: InventoryItem) => void;
  /** Item id to briefly highlight (from the alert banner jump). */
  highlightId: string | null;
}

const BAR_TONE: Record<InventoryItem['status'], 'success' | 'warning' | 'danger'> = {
  adequate: 'success',
  'low-stock': 'warning',
  critical: 'danger',
  'out-of-stock': 'danger',
};

/** Days until expiry; null when there is no expiry date. */
function daysUntilExpiry(iso: string | null): number | null {
  if (!iso) return null;
  const exp = new Date(`${iso}T00:00:00`).getTime();
  if (Number.isNaN(exp)) return null;
  return Math.ceil((exp - Date.now()) / (24 * 60 * 60 * 1000));
}

export default function InventoryTable({
  items,
  loading,
  error,
  onRetry,
  onRestock,
  highlightId,
}: InventoryTableProps) {
  return (
    <GlassCard padded={false} className="overflow-hidden">
      <div className="border-b border-white/5 px-5 py-4">
        <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
          Stock Room
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {items.length} item{items.length === 1 ? '' : 's'} · supply level = quantity vs threshold
        </p>
      </div>

      {loading ? (
        <LoadingState label="Loading inventory…" className="py-14" />
      ) : error ? (
        <div className="p-4">
          <ErrorState title="Could not load inventory" message={error} onRetry={onRetry} retryLabel="Retry" />
        </div>
      ) : items.length === 0 ? (
        <p className="px-5 py-14 text-center text-sm text-[var(--color-text-secondary)]">
          No items match the current filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <caption className="sr-only">Inventory items</caption>
            <tbody>
              {items.map((item) => {
                const days = daysUntilExpiry(item.expiryDate);
                const expiryTone = days !== null && days <= 7 ? 'danger' : days !== null && days <= 30 ? 'warning' : 'default';
                return (
                  <tr
                    key={item.id}
                    id={`inv-row-${item.id}`}
                    className={cn(
                      'border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]',
                      highlightId === item.id && 'bg-white/[0.06] ring-1 ring-inset ring-[var(--color-warning-border)]'
                    )}
                  >
                    <td className="max-w-[280px] px-5 py-3.5">
                      <p className="truncate font-medium text-[var(--color-text-primary)]">{item.name}</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">{item.stationName ?? '—'}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="whitespace-nowrap text-xs tabular-nums text-[var(--color-text-primary)]">
                        {item.quantity}
                      </span>
                      <span className="ml-1 text-[11px] text-[var(--color-text-secondary)]">/ {item.threshold}</span>
                    </td>
                    <td className="w-[180px] px-3 py-3.5">
                      <ProgressBar
                        value={Math.min(100, (item.quantity / Math.max(1, item.threshold)) * 100)}
                        tone={BAR_TONE[item.status]}
                        size="sm"
                        showValue
                      />
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-3 py-3.5">
                      {item.expiryDate ? (
                        <span
                          className={cn(
                            'whitespace-nowrap text-xs tabular-nums',
                            expiryTone === 'danger' && 'font-medium text-[var(--color-danger)]',
                            expiryTone === 'warning' && 'font-medium text-[var(--color-warning)]',
                            expiryTone === 'default' && 'text-[var(--color-text-primary)]'
                          )}
                        >
                          {item.expiryDate}
                          {expiryTone !== 'default' && (
                            <span className="ml-1 text-[10px] uppercase tracking-wide">
                              {days !== null && days < 0 ? 'expired' : `${days}d`}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-text-secondary)]">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-xs text-[var(--color-text-secondary)]">
                      {timeAgo(item.lastRestocked)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onRestock(item)}
                        aria-label={`Restock ${item.name}`}
                      >
                        Restock
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}