import { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext(null);

// Dashboard supports light/dark (see theme.css :root vs .dark).
// Landing always stays the immersive dark theme regardless of this setting.
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('polarx_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('polarx_theme', mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>{children}</ThemeContext.Provider>
  );
}
