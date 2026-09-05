/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'arctic-night': '#0D1B2A',
        'ice-sea': '#1B3A6B',
        'glacier-blue': '#A8D8F0',
        'aurora-green': '#6FCF97',
        'aurora-purple': '#9D4EDD',
        'emergency-red': '#FF6B6B',
        'sky-accent': '#38BDF8',
        'corpo-bg': '#F8FAFC',
        'corpo-text': '#0F172A',
        'corpo-text-muted': '#475569',
        'dark-text': '#E2E8F0',
        'dark-text-muted': '#94A3B8',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      backdropBlur: {
        xs: '4px',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'rotate(25deg) translateX(-100%)' },
          '100%': { transform: 'rotate(25deg) translateX(100%)' },
        },
        auroraDrift: {
          '0%': { transform: 'translateX(0) scale(1)' },
          '100%': { transform: 'translateX(5%) scale(1.05)' },
        },
        frostFall: {
          '0%': { transform: 'translateY(-10vh) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.8' },
          '100%': { transform: 'translateY(110vh) translateX(20px)', opacity: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 8s ease-in-out infinite',
        auroraDrift: 'auroraDrift 15s ease-in-out infinite alternate',
        frostFall: 'frostFall linear infinite',
      },
    },
  },
  plugins: [],
};
