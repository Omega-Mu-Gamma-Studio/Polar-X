import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ClayCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Lock the extruded surface into its pressed (inset) state. */
  pressed?: boolean;
}

/** Soft, extruded clay surface — structural chrome, summary tiles, buttons. */
export default function ClayCard({ children, className, pressed = false, ...rest }: ClayCardProps) {
  return (
    <div className={cn('polar-clay', pressed && 'pressed', className)} {...rest}>
      {children}
    </div>
  );
}
