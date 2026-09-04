import type { ComponentType, SVGProps } from 'react';
import GlassCard from './GlassCard';
import StatusBadge from './StatusBadge';

interface ComingSoonProps {
  /** Optional roadmap phase. Omit when a module is planned but not slotted into a specific build phase. */
  phase?: number;
  title: string;
  description: string;
  features: string[];
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/** Placeholder body shown on every Phase 0 stub route. */
export default function ComingSoon({ phase, title, description, features, icon: Icon }: ComingSoonProps) {
  return (
    <GlassCard className="relative min-h-[300px] overflow-hidden p-8 sm:p-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-aurora-soft shadow-[var(--shadow-clay-pressed)]">
              <Icon width={28} height={28} className="text-[var(--color-accent)]" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                {title}
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {description}
              </p>
            </div>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="rounded-lg border border-[var(--color-border-glass)] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]"
              >
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0">
          <StatusBadge status="info" label={phase !== undefined ? `Phase ${phase} — planned` : 'Planned'} />
        </div>
      </div>
    </GlassCard>
  );
}
