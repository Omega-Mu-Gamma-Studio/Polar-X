import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface LayoutContextValue {
  /** Desktop sidebar collapsed to icon rail */
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  /** Mobile (< lg) drawer state */
  mobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const value = useMemo<LayoutContextValue>(
    () => ({
      sidebarCollapsed,
      toggleSidebarCollapsed: () => setSidebarCollapsed((c) => !c),
      mobileSidebarOpen,
      openMobileSidebar: () => setMobileSidebarOpen(true),
      closeMobileSidebar: () => setMobileSidebarOpen(false),
    }),
    [sidebarCollapsed, mobileSidebarOpen]
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayoutContext(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error('useLayoutContext must be used inside <LayoutProvider>');
  }
  return ctx;
}
