import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export default function Navbar({ alertCount = 0 }) {
  const [query, setQuery] = useState('');
  const { mode, toggleMode } = useTheme();

  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b"
      style={{ borderColor: 'var(--card-border)' }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search missions, shipments, personnel..."
        className="text-sm px-3 py-2 rounded-lg outline-none"
        style={{
          background: 'var(--card-bg)',
          border: `1px solid var(--card-border)`,
          color: 'var(--text-primary)',
          width: 320,
        }}
      />

      <div className="flex items-center gap-4">
        <button
          onClick={toggleMode}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}
          aria-label={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {mode === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <button
          className="relative w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          aria-label={`${alertCount} alerts`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinejoin="round" />
            <path d="M13.7 21a2 2 0 01-3.4 0" strokeLinejoin="round" />
          </svg>
          {alertCount > 0 && (
            <span
              className="absolute -top-1 -right-1 text-[10px] rounded-full flex items-center justify-center"
              style={{
                width: 16,
                height: 16,
                background: 'var(--emergency-red)',
                color: '#fff',
              }}
            >
              {alertCount}
            </span>
          )}
        </button>

        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
          style={{ background: 'var(--accent-primary)', color: 'var(--arctic-night, #0D1B2A)' }}
        >
          MC
        </div>
      </div>
    </header>
  );
}
