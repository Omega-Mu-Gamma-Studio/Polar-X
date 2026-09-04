import { useMemo } from 'react';

interface ParticleConfig {
  left: string;
  size: number;
  duration: string;
  delay: string;
  drift: string;
  opacity: number;
}

const PARTICLE_COUNT = 22;

/**
 * Floating frost particles for the hero. Pure CSS transforms (translate3d +
 * opacity), configured once via useMemo with a deterministic spread — no
 * per-frame JS, capped density, GPU-composited.
 */
export default function IceParticles() {
  const particles = useMemo<ParticleConfig[]>(() => {
    let seed = 1337;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      left: `${(rand() * 100).toFixed(1)}%`,
      size: 2 + rand() * 4,
      duration: `${(13 + rand() * 14).toFixed(1)}s`,
      delay: `${(-rand() * 22).toFixed(1)}s`,
      drift: `${((rand() - 0.5) * 80).toFixed(0)}px`,
      opacity: 0.25 + rand() * 0.4,
    })).map((config) => ({
      ...config,
      // Stagger a third of the particles' start delay so the field looks full
      // immediately instead of empty for the first cycle.
      ...(Math.random() < 0.34 ? { delay: `-${(rand() * 12).toFixed(1)}s` } : {}),
    }));
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle, index) => (
        <span
          key={index}
          className="ice-particle absolute rounded-full bg-[#cfe8f7] blur-[1px]"
          style={
            {
              left: particle.left,
              width: particle.size,
              height: particle.size,
              top: '100%',
              '--p-duration': particle.duration,
              '--p-delay': particle.delay,
              '--p-drift': particle.drift,
              '--p-opacity': particle.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}