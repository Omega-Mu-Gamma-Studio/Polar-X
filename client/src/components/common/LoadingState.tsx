import { cn } from '@/utils/cn';

interface LoadingStateProps {
  label?: string;
  hint?: string;
  className?: string;
}

/** Rendered by every data-fetching surface while it loads. */
export default function LoadingState({ label = 'Loading…', hint, className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}
    >
      <span className="loader-ring" aria-hidden />
      <div>
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</p>
        {hint && <p className="mt-1 text-xs text-[var(--color-text-secondary)] opacity-70">{hint}</p>}
      </div>
    </div>
  );
}
