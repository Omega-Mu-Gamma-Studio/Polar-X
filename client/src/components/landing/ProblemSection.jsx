import { useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref} className="font-display text-5xl md:text-6xl font-light">
      {value}
      {suffix}
    </span>
  );
}

const STATS = [
  { value: 18, suffix: 't', label: 'of cargo airlifted in an emergency Russian aircraft charter' },
  { value: 47, suffix: '', label: 'personnel at Bharati alone, dependent on planning that once ran on spreadsheets' },
  { value: 3, suffix: '', label: 'stations, five disconnected tools, and no single view across any of them' },
];

export default function ProblemSection() {
  return (
    <section className="relative py-28 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="font-display text-2xl md:text-3xl font-light mb-16 max-w-xl"
        >
          Supply coordination for three of the harshest research posts on earth
          shouldn't depend on someone's satellite phone call going through.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="polar-card p-8"
            >
              <Counter to={s.value} suffix={s.suffix} />
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
