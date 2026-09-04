import Button from '@/components/common/Button';
import { IconSnowflake } from '@/components/common/Icons';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-aurora-soft">
            <IconSnowflake width={14} height={14} className="text-[var(--color-accent)]" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold tracking-[0.22em] text-[var(--color-text-primary)]">
              POLARX
            </p>
            <p className="text-[10px] text-[var(--color-text-secondary)]">
              St. Xavier&apos;s Catholic College of Engineering, Nagercoil · SIH 2026 · Problem ID 26062
            </p>
          </div>
        </div>
        <Button to="/app" variant="secondary" size="sm" icon={<IconSnowflake width={14} height={14} />}>
          Enter Command Center
        </Button>
      </div>
    </footer>
  );
}