import { motion } from 'framer-motion';

const STATIONS = [
  {
    name: 'Bharati',
    location: 'Antarctica',
    established: 2012,
    capacity: 47,
    note: 'The largest of the three, and the one the 18-ton airlift was meant to save.',
  },
  {
    name: 'Maitri',
    location: 'Antarctica',
    established: 1989,
    capacity: 25,
    note: "India's longest-running Antarctic station, still running rotations after 35 years.",
  },
  {
    name: 'Himadri',
    location: 'Svalbard, Arctic',
    established: 2008,
    capacity: 12,
    note: 'The only Arctic post — a different hemisphere, the same coordination problem.',
  },
];

export default function StationGallery() {
  return (
    <section className="relative py-28 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-sm tracking-wide mb-3"
          style={{ color: 'var(--accent-primary)' }}
        >
          The three stations
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {STATIONS.map((station, i) => (
            <motion.div
              key={station.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="polar-card p-7"
            >
              <h3 className="font-display text-xl mb-1">{station.name}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--accent-primary)' }}>
                {station.location} &middot; est. {station.established}
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                {station.note}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Capacity: {station.capacity} personnel
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
