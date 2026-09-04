import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Apply the default inner padding (p-6). Set false for tight content like menus. */
  padded?: boolean;
}

/** Frosted, translucent glass surface — floating panels, modals, dropdowns. */
export default function GlassCard({ children, className, padded = true, ...rest }: GlassCardProps) {
  return (
    <div className={cn('polar-glass', padded && 'p-6', className)} {...rest}>
      {children}
    </div>
  );
}
