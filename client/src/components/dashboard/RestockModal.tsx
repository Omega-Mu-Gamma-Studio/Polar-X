import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { InventoryItem } from '@/services/inventoryApi';
import { updateInventoryItem } from '@/services/inventoryApi';
import Button from '@/components/common/Button';
import GlassCard from '@/components/common/GlassCard';
import StatusBadge from '@/components/common/StatusBadge';
import { IconBox, IconX } from '@/components/common/Icons';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { cn } from '@/utils/cn';

interface RestockModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSaved: (updated: InventoryItem) => void;
}

export default function RestockModal({ item, onClose, onSaved }: RestockModalProps) {
  const [quantity, setQuantity] = useState<string>(String(item.quantity));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useCallback(onClose, [onClose]);
  const containerRef = useFocusTrap(true, closeRef);

  const parsed = Number(quantity);
  const valid = Number.isInteger(parsed) && parsed >= 0;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateInventoryItem(item.id, { quantity: parsed });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update quantity');
    } finally {
      setSaving(false);
    }
  }

  // Reset the draft whenever a different item opens the modal.
  useEffect(() => {
    setQuantity(String(item.quantity));
    setError(null);
  }, [item.id, item.quantity]);

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close restock dialog"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Restock ${item.name}`}
        className="relative w-full max-w-md"
      >
        <GlassCard padded={false} className="overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <IconBox width={18} height={18} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-display text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
                  {item.name}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {item.stationName ?? 'Station'} · threshold {item.threshold}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close restock dialog"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
            >
              <IconX width={18} height={18} />
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4 px-5 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.status} size="sm" />
              <span className="text-[11px] text-[var(--color-text-secondary)]">
                currently {item.quantity} units
              </span>
            </div>

            <div>
              <label htmlFor="restock-quantity" className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                New quantity
              </label>
              <input
                id="restock-quantity"
                type="number"
                min={0}
                step={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className={cn(
                  'h-11 w-full rounded-xl border bg-[var(--color-surface-glass)] px-3.5 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent-border)]',
                  valid ? 'border-[var(--color-border-glass)]' : 'border-[var(--color-danger-border)]'
                )}
                autoComplete="off"
              />
              {!valid && (
                <p className="mt-1.5 text-xs text-[var(--color-danger)]">Enter a non-negative whole number.</p>
              )}
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-3 py-2 text-xs text-[var(--color-danger)]">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="md" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" disabled={!valid || saving}>
                {saving ? 'Saving…' : 'Save restock'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
}