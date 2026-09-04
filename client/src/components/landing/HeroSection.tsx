import Button from '@/components/common/Button';
import { IconSnowflake } from '@/components/common/Icons';
import IceParticles from './IceParticles';

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Background gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)',
        }}
      />

      {/* Aurora glow blobs (blurred, drifting, low opacity) */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div
          className="aurora-blob absolute -top-24 left-1/4 h-[420px] w-[560px] rounded-full opacity-25"
          style={{
            background:
              'radial-gradient(closest-side, rgba(111,207,151,0.55), rgba(168,216,240,0.25) 45%, rgba(150,130,220,0.18) 70%, transparent)',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="aurora-blob absolute top-1/3 -right-32 h-[380px] w-[520px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(closest-side, rgba(168,216,240,0.5), rgba(150,130,220,0.3) 55%, transparent)',
            filter: 'blur(80px)',
            animationDelay: '-6s',
          }}
        />
        <div
          className="aurora-blob absolute -bottom-40 left-1/2 h-[360px] w-[600px] -translate-x-1/2 rounded-full opacity-15"
          style={{
            background:
              'radial-gradient(closest-side, rgba(150,130,220,0.45), rgba(111,207,151,0.2) 60%, transparent)',
            filter: 'blur(90px)',
            animationDelay: '-12s',
          }}
        />
      </div>

      <IceParticles />

      <div className="relative z-10 max-w-2xl">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-aurora-soft shadow-[var(--shadow-clay-pressed)]">
          <IconSnowflake width={30} height={30} className="animate-float-soft text-[var(--color-accent)]" />
        </span>
        <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.42em] text-[var(--color-accent)]">
          Polar Expedition Logistics &amp; Asset Management
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-6xl">
          POLARX
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          Integrated command for India&apos;s polar research stations — shipments, stock, crews and
          emergency response, live from the ice.
        </p>
        <div className="mt-9">
          <Button
            to="/app"
            size="lg"
            icon={<IconSnowflake width={16} height={16} />}
            className="px-7 shadow-[var(--glow-aurora)] hover:shadow-[0_0_34px_rgba(168,216,240,0.35)]"
          >
            Enter Command Center
          </Button>
        </div>
      </div>

      {/* Scroll hint */}
      <div aria-hidden className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="h-9 w-5 rounded-full border border-white/15">
          <div className="mx-auto mt-1.5 h-2 w-1 animate-bounce rounded-full bg-[var(--color-accent)]" />
        </div>
      </div>
    </section>
  );
}