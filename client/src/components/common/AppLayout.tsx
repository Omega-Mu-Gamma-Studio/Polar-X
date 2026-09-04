import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useLayoutContext } from '@/context/LayoutContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import LoadingState from './LoadingState';
import { cn } from '@/utils/cn';

/** Fixed app shell — clay sidebar + clay topbar + content outlet. */
export default function AppLayout() {
  const { sidebarCollapsed } = useLayoutContext();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-300 ease-out',
          sidebarCollapsed ? 'lg:pl-[var(--sidebar-w-collapsed)]' : 'lg:pl-[var(--sidebar-w)]'
        )}
      >
        <Topbar />
        <main className="mx-auto w-full max-w-[1560px] flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <Suspense fallback={<LoadingState label="Loading module…" />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="pb-4 text-center text-[11px] text-[var(--color-text-secondary)] opacity-60">
          PolarX · Integrated Polar Expedition Logistics · SIH 2026 · Problem ID 26062 · Phases 0–7 complete
        </footer>
      </div>
    </div>
  );
}
