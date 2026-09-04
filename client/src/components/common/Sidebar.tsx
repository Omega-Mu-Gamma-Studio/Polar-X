import type { ComponentType, SVGProps } from 'react';
import { NavLink } from 'react-router-dom';
import { useLayoutContext } from '@/context/LayoutContext';
import Button from './Button';
import {
  IconCargo,
  IconChevronsLeft,
  IconDashboard,
  IconEmergency,
  IconHelp,
  IconInventory,
  IconPersonnel,
  IconSettings,
  IconSnowflake,
  IconStations,
} from './Icons';
import { cn } from '@/utils/cn';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

interface NavItem {
  to: string;
  label: string;
  icon: IconType;
  /** Exact match (used for the index route). */
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/app/stations', label: 'Stations', icon: IconStations },
  { to: '/app/cargo', label: 'Cargo / Shipments', icon: IconCargo },
  { to: '/app/inventory', label: 'Inventory', icon: IconInventory },
  { to: '/app/personnel', label: 'Personnel', icon: IconPersonnel },
  { to: '/app/emergency', label: 'Emergency / Alerts', icon: IconEmergency },
  { to: '/app/settings', label: 'Settings', icon: IconSettings },
];

interface NavLinkItemProps {
  item: NavItem;
  rail: boolean;
  onNavigate: () => void;
}

function NavLinkItem({ item, rail, onNavigate }: NavLinkItemProps) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={item.label}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-150',
          rail ? 'mx-auto h-11 w-11 justify-center' : 'gap-3 px-3 py-2.5',
          isActive
            ? 'bg-[var(--color-surface-glass)] text-[var(--color-accent)] shadow-[var(--glow-aurora)]'
            : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden
              className={cn(
                'absolute rounded-full',
                rail
                  ? 'bottom-1.5 left-1/2 h-[3px] w-6 -translate-x-1/2'
                  : 'left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full'
              )}
              style={{
                background: 'var(--aurora-gradient)',
                boxShadow: '0 0 10px rgba(168, 216, 240, 0.65)',
              }}
            />
          )}
          <Icon className={cn('shrink-0 transition-transform duration-150 group-hover:scale-110', rail ? 'h-5 w-5' : 'h-[18px] w-[18px]')} />
          {!rail && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapsed, mobileSidebarOpen, closeMobileSidebar } =
    useLayoutContext();
  const rail = sidebarCollapsed && !mobileSidebarOpen;

  return (
    <>
      {/* Mobile drawer backdrop */}
      {mobileSidebarOpen && (
        <div
          aria-hidden
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        aria-label="Primary"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden',
          'bg-[var(--color-surface-clay)] shadow-[10px_0_28px_rgba(0,0,0,0.35)]',
          'transition-all duration-300 ease-out',
          rail ? 'w-[var(--sidebar-w-collapsed)]' : 'w-[var(--sidebar-w)]',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className={cn('flex h-[var(--topbar-h)] shrink-0 items-center gap-2 px-4', rail && 'justify-center px-2')}>
          <NavLink
            to="/app"
            end
            onClick={closeMobileSidebar}
            title="PolarX — home"
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-aurora-soft shadow-[var(--shadow-clay-pressed)]">
              <IconSnowflake width={18} height={18} className="animate-float-soft text-[var(--color-accent)]" />
            </span>
            {!rail && (
              <span className="min-w-0">
                <span className="block font-display text-[15px] font-semibold tracking-[0.22em] text-[var(--color-text-primary)]">
                  POLARX
                </span>
                <span className="block truncate text-[10px] tracking-wide text-[var(--color-text-secondary)]">
                  Polar Expedition Logistics
                </span>
              </span>
            )}
          </NavLink>
        </div>

        <div className="mx-3 shrink-0 border-t border-white/5" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLinkItem key={item.to} item={item} rail={rail} onNavigate={closeMobileSidebar} />
          ))}
        </nav>

        {/* Footer — support + collapse control */}
        <div className="mt-auto shrink-0 border-t border-white/5 p-3">
          <div className={cn('flex items-center gap-2', rail && 'flex-col gap-3')}>
            {rail ? (
              <button
                type="button"
                title="Contact support — arrives in a later phase"
                aria-label="Need help? Contact support"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] text-[var(--color-text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--color-text-primary)]"
              >
                <IconHelp width={16} height={16} />
              </button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                icon={<IconHelp width={16} height={16} />}
                title="Contact support — arrives in a later phase"
                className="min-w-0 flex-1 justify-start px-3"
              >
                <span className="truncate">Need Help? Contact Support</span>
              </Button>
            )}

            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              aria-label={rail ? 'Expand sidebar' : 'Collapse sidebar'}
              title={rail ? 'Expand sidebar' : 'Collapse sidebar'}
              className={cn(
                'hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors lg:flex',
                'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]'
              )}
            >
              <IconChevronsLeft width={16} height={16} className={cn('transition-transform duration-300', rail && 'rotate-180')} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
