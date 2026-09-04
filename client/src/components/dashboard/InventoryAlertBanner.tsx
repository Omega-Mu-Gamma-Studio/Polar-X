import { useEffect, useState } from 'react';
import type { InventoryItem } from '@/services/inventoryApi';
import { fetchInventoryAlerts } from '@/services/inventoryApi';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import { IconAlertTriangle } from '@/components/common/Icons';

interface InventoryAlertBannerProps {
  /** Jump to a table row when an alert chip is clicked. */
  onJump: (itemId: string) => void;
}

interface AlertEntry {
  item: InventoryItem;
  reason: string;
  status: InventoryItem['status'] | 'warning';
}

function reasonFor(item: InventoryItem): AlertEntry {
  if (item.status === 'out-of-stock') {
    return { item, status: 'out-of-stock', reason: 'out of stock' };
  }
  if (item.status === 'critical') {
    return { item, status: 'critical', reason: 'critical stock' };
  }
  if (item.expiryDate) {
    const days = Math.ceil((new Date(`${item.expiryDate}T00:00:00`).getTime() - Date.now()) / 86_400_000);
    return { item, status: 'warning', reason: days < 0 ? 'expired' : `expires in ${days}d` };
  }
  return { item, status: 'warning', reason: 'needs attention' };
}

/** Compact list of items needing attention; fetches its own data so this
 *  section keeps independent loading/error state. */
export default function InventoryAlertBanner({ onJump }: InventoryAlertBannerProps) {
  const [alerts, setAlerts] = useState<AlertEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchInventoryAlerts()
      .then((items) => {
        if (!active) return;
        setAlerts(items.map(reasonFor));
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load alerts');
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) return null; // a banner must never break the page; table rows still show status
  if (!alerts || alerts.length === 0) return null;

  return (
    <GlassCard className="border-[var(--color-warning-border)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
          <IconAlertTriangle width={16} height={16} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {alerts.length} item{alerts.length === 1 ? '' : 's'} need attention
          </h2>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {alerts.slice(0, 12).map((entry) => (
              <li key={entry.item.id}>
                <button
                  type="button"
                  onClick={() => onJump(entry.item.id)}
                  className="inline-flex max-w-[260px] items-center gap-2 rounded-lg border border-[var(--color-border-glass)] bg-white/[0.03] px-2.5 py-1.5 text-left transition-colors hover:bg-white/[0.07]"
                >
                  <span className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                    {entry.item.name}
                  </span>
                  <StatusBadge status={entry.status} size="sm" label={entry.reason} />
                </button>
              </li>
            ))}
            {alerts.length > 12 && (
              <li className="self-center text-[11px] text-[var(--color-text-secondary)]">
                +{alerts.length - 12} more…
              </li>
            )}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}