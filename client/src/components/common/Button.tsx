import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon rendered before children. */
  icon?: ReactNode;
  /** Square icon-only button (use aria-label). */
  iconOnly?: boolean;
  /** When set, renders as a router <Link> with the same visual treatment. */
  to?: string;
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

const VARIANTS: Record<ButtonVariant, string> = {
  // Aurora-green CTA with a soft glow on hover
  primary:
    'bg-[var(--color-success)] text-[#071409] hover:shadow-[var(--glow-success)] hover:brightness-110',
  // Frosted glass
  secondary:
    'border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] text-[var(--color-text-primary)] backdrop-blur-md hover:bg-white/10',
  danger:
    'border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] hover:shadow-[var(--glow-danger)] hover:bg-[var(--color-danger-soft)]',
  ghost: 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  to,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = cn(
    'inline-flex select-none items-center justify-center rounded-xl font-medium transition-all duration-200',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    SIZES[size],
    iconOnly && 'px-0',
    VARIANTS[variant],
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={rest['aria-label']} title={rest.title}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}
