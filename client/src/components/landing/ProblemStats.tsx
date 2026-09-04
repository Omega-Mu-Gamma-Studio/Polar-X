import { useEffect, useRef, useState } from 'react';
import GlassCard from '@/components/common/GlassCard';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 18, suffix: 'tons', label: 'airlifted via emergency charter due to delays' },
  { value: 47, suffix: 'crew', label: 'at Bharati Station relying on the current supply chain' },
  { value: 3, suffix: 'stations', label: 'research stations operating on disconnected systems' },
];

/** Counts 0 → target once, when the element scrolls into view. */
function useCountUp(target: number, active: boolean): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();
    const duration = 1400;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, active]);
  return value;
}

export default function ProblemStats() {
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Fire once for the whole section — individual cards read the same flag so
  // the numbers only animate on first scroll-in, never on scroll wobble.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={rootRef} className="relative mx-auto max-w-5xl px-6 py-24">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--color-accent)]">
        The Problem
      </p>
      <h2 className="mt-3 text-center font-display text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
        Disconnected logistics cost lives and science
      </h2>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {STATS.map((stat, index) => (
          <CountCard key={stat.label} stat={stat} active={visible} index={index} />
        ))}
      </div>
    </section>
  );
}

function CountCard({ stat, active, index }: { stat: Stat; active: boolean; index: number }) {
  const value = useCountUp(stat.value, active);
  return (
    <GlassCard className="flex flex-col items-center justify-center p-8 text-center">
      <p
        className="stat-land font-display text-5xl font-bold tabular-nums tracking-tight text-[var(--color-accent)]"
        style={{ animationDelay: `${index * 0.15}s` }}
      >
        {value}
        <span className="ml-1.5 text-lg font-semibold text-[var(--color-text-secondary)]">{stat.suffix}</span>
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{stat.label}</p>
    </GlassCard>
  );
}