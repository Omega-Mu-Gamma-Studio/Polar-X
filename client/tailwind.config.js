/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // "Polar Ice & Aurora" — dark theme palette (single source: styles/tokens.css)
        base: 'var(--color-bg-primary)', // Deep Arctic Night
        panel: 'var(--color-bg-secondary)', // Ice Sea
        clay: 'var(--color-surface-clay)', // clay element fill
        accent: 'var(--color-accent)', // Glacier Blue
        success: 'var(--color-success)', // Aurora Green
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)', // Emergency Red
        info: 'var(--color-info)',
        ink: 'var(--color-text-primary)',
        muted: 'var(--color-text-secondary)',
        line: 'var(--color-border-glass)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'Poppins',
          'Montserrat',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: 'var(--shadow-glass)',
        clay: 'var(--shadow-clay)',
        'clay-pressed': 'var(--shadow-clay-pressed)',
        'glow-aurora': 'var(--glow-aurora)',
        'glow-success': 'var(--glow-success)',
        'glow-danger': 'var(--glow-danger)',
        'glow-accent': 'var(--glow-accent)',
      },
      borderRadius: {
        '2.5xl': '20px',
      },
    },
  },
  plugins: [],
};
