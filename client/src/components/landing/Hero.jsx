import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function useFrostParticles(count = 28) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 10 + Math.random() * 14,
      delay: Math.random() * -20,
    }));
  }, [count]);
}

export default function Hero() {
  const navigate = useNavigate();
  const particles = useFrostParticles();

  return (
    <section
      className="relative min-h-screen overflow-hidden flex items-center"
      style={{
        background:
          'linear-gradient(180deg, rgba(13,27,42,0.55) 0%, rgba(13,27,42,0.92) 65%, #0D1B2A 100%), ' +
          'radial-gradient(ellipse at 30% 20%, rgba(168,216,240,0.10) 0%, transparent 55%), ' +
          'radial-gradient(ellipse at 75% 75%, rgba(13,27,42,1) 0%, #0D1B2A 60%)',
      }}
    >
      <div className="aurora-container" />
      <div className="frost-overlay" />

      {particles.map((p) => (
        <span
          key={p.id}
          className="frost-particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="polar-card p-10 md:p-14 max-w-2xl"
        >
          <p className="text-sm tracking-wide mb-4" style={{ color: 'var(--accent-primary)' }}>
            NCPOR &middot; Ministry of Earth Sciences
          </p>

          <h1 className="font-display text-4xl md:text-5xl font-light leading-tight mb-6">
            Three stations.
            <br />
            One command center.
          </h1>

          <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            Bharati, Maitri, and Himadri once relied on spreadsheets, radio logs, and
            email chains to stay supplied, until 18 tons had to be airlifted in on a
            Russian aircraft. PolarX replaces that with one live view of cargo,
            inventory, personnel, and emergencies across every station.
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-7 py-3 rounded-full font-medium transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--accent-primary)', color: 'var(--arctic-night)', boxShadow: 'var(--accent-glow)' }}
          >
            Enter Command Center
          </button>
        </motion.div>
      </div>
    </section>
  );
}
