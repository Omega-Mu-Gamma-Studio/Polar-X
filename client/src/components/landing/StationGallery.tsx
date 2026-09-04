import { useEffect, useRef, useState } from 'react';
import { useStations } from '@/hooks/useStations';
import ClayCard from '@/components/common/ClayCard';
import ErrorState from '@/components/common/ErrorState';
import { IconStations } from '@/components/common/Icons';
import { cn } from '@/utils/cn';

const STATION_TONE: Record<string, string> = {
  Bharati: 'var(--color-danger)',
  Maitri: 'var(--color-text-primary)',
  Himadri: 'var(--color-info)',
};

const REGION_LABEL: Record<string, string> = {
  Antarctica: 'Antarctica',
  Arctic: 'Arctic',
};

export default function StationGallery() {
  const { stations, loading, error, refetch } = useStations();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const refs = useRef<(HTMLElement | null)[]>([]);

  // Highlight whichever station panel is currently in the viewport; only one
  // can be active at a time.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(Number.isFinite(index) ? index : null);
          }
        }
      },
      { threshold: 0.55 }
    );
    for (const node of refs.current) {
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [stations.length]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--color-accent)]">
        The Network
      </p>
      <h2 className="mt-3 text-center font-display text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
        Three stations, one command view
      </h2>

      {loading ? (
        <div className="mt-10 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-[20px] bg-white/[0.04]" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-10">
          <ErrorState title="Could not load stations" message={error} onRetry={refetch} retryLabel="Retry" />
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {stations.map((station, index) => {
            const active = activeIndex === index;
            return (
              <article
                key={station.id}
                ref={(node) => {
                  refs.current[index] = node;
                }}
                data-index={index}
                className={cn(
                  'transition-all duration-300',
                  active ? 'scale-[1.015]' : 'scale-[0.99] opacity-55'
                )}
              >
                <ClayCard
                  className={cn(
                    'relative flex flex-wrap items-center gap-5 p-6 transition-all duration-300',
                    active && 'bg-[var(--color-surface-clay)]'
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-[20px]"
                      style={{ boxShadow: '0 0 0 1px rgba(168,216,240,0.35), 0 0 28px rgba(168,216,240,0.22) inset' }}
                    />
                  )}
                  {/* Side indicator */}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full transition-all duration-300',
                      active ? 'bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]' : 'bg-white/15'
                    )}
                  />
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-white/[0.04]"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', color: STATION_TONE[station.name] ?? 'var(--color-accent)' }}
                  >
                    <IconStations width={24} height={24} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                      {station.name} Station
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {REGION_LABEL[station.region] ?? station.region} · operational since {station.foundedYear}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-2xl font-semibold tabular-nums text-[var(--color-text-primary)]">
                      {station.capacity}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-[var(--color-text-secondary)]">
                      berthing capacity
                    </p>
                  </div>
                </ClayCard>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}