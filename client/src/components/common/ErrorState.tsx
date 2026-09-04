import type { ReactNode } from 'react';
import Button from './Button';
import { IconAlertTriangle } from './Icons';
import { cn } from '@/utils/cn';

interface ErrorStateProps {
  title?: string;
  message?: string;
  /** Show a retry button wired to this handler. */
  onRetry?: () => void;
  retryLabel?: string;
  children?: ReactNode;
  className?: string;
}

/** Never fail silently — every data surface renders this on error. */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'The request could not be completed. Check your connection and try again.',
  onRetry,
  retryLabel = 'Try again',
  children,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'polar-glass flex flex-col items-center justify-center gap-4 p-10 text-center',
        className
      )}
    >
      <span
        aria-hidden
        className="flex h-14 w-14 items-center justify-center rounded-2xl border"
        style={{
          background: 'var(--color-danger-soft)',
          borderColor: 'var(--color-danger-border)',
          color: 'var(--color-danger)',
        }}
      >
        <IconAlertTriangle width={26} height={26} />
      </span>
      <div>
        <p className="font-display text-lg font-semibold text-[var(--color-text-primary)]">{title}</p>
        {message && (
          <p className="mx-auto mt-1 max-w-md text-sm text-[var(--color-text-secondary)]">
            {message}
          </p>
        )}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
      {children}
    </div>
  );
}
