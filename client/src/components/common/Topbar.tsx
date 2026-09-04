import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLayoutContext } from '@/context/LayoutContext';
import { useAuth } from '@/context/AuthContext';
import { useEmergencyAlerts } from '@/hooks/useEmergencyAlerts';
import { timeAgo } from '@/utils/datetime';
import StatusBadge, { type BadgeStatus } from './StatusBadge';
import {
  IconBell,
  IconChevronDown,
  IconLogout,
  IconMenu,
  IconSearch,
  IconSettings,
} from './Icons';
import { cn } from '@/utils/cn';

/** Avatar initials from a name ("Commander Polar" → "CP"). */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

const severityBadge: Record<string, BadgeStatus> = {
  critical: 'critical',
  warning: 'warning',
  info: 'info',
};

export default function Topbar() {
  const { openMobileSidebar } = useLayoutContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Live notification centre — backed by the same alerts API/socket as /emergency.
  const { alerts } = useEmergencyAlerts();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeAlerts = alerts.filter((alert) => alert.status === 'active');
  const recentAlerts = [...activeAlerts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  const displayName = user?.name ?? 'Guest';
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Viewer';

  const closeAll = () => {
    setAlertsOpen(false);
    setProfileOpen(false);
  };

  // Close popovers on outside click / Escape.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) closeAll();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeAll();
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-[var(--topbar-h)] items-center',
        'border-b border-white/5',
        'bg-[color-mix(in_srgb,var(--color-surface-clay)_92%,transparent)] backdrop-blur-xl'
      )}
    >
      <div ref={rootRef} className="mx-auto flex h-full w-full max-w-[1560px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile: open the drawer */}
        <button
          type="button"
          onClick={openMobileSidebar}
          aria-label="Open navigation"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)] lg:hidden"
        >
          <IconMenu width={19} height={19} />
        </button>

        {/* Search (stub until a later phase) */}
        <div className="relative hidden w-full max-w-md flex-1 md:block">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--color-text-secondary)]">
            <IconSearch width={16} height={16} />
          </span>
          <input
            type="search"
            aria-label="Search (stub)"
            placeholder="Search cargo, personnel, stations…"
            className={cn(
              'h-10 w-full rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] pl-9 pr-14',
              'text-sm text-[var(--color-text-primary)] backdrop-blur-md transition-colors',
              'placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent-border)]'
            )}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 flex h-5 -translate-y-1/2 items-center rounded-md border border-white/10 bg-white/5 px-1.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
            Ctrl K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setAlertsOpen((open) => !open);
                setProfileOpen(false);
              }}
              aria-label="Notifications"
              aria-expanded={alertsOpen}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
            >
              <IconBell width={18} height={18} />
              {activeAlerts.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[var(--color-surface-clay)] bg-[var(--color-danger)] px-0.5 text-[10px] font-bold leading-none text-white">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {alertsOpen && (
              <div className="polar-glass absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] p-1.5">
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Notifications · {activeAlerts.length} active
                </p>
                {recentAlerts.length === 0 ? (
                  <p className="px-3 py-6 text-center text-xs text-[var(--color-text-secondary)]">
                    All clear — no active alerts.
                  </p>
                ) : (
                  <ul className="space-y-0.5">
                    {recentAlerts.map((alert) => (
                      <li key={alert.id}>
                        <Link
                          to="/app/emergency"
                          onClick={closeAll}
                          className="flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                        >
                          <StatusBadge status={severityBadge[alert.severity] ?? 'info'} size="sm" className="mt-0.5 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs leading-snug text-[var(--color-text-primary)]">
                              {alert.alertType} — {alert.stationName ?? 'Station'}
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] text-[var(--color-text-secondary)]">
                              {alert.description ?? alert.status} · {timeAgo(alert.timestamp)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to="/app/emergency"
                  onClick={closeAll}
                  className="block border-t border-white/5 px-3 py-2 text-[10px] font-medium text-[var(--color-accent)] hover:underline"
                >
                  Open Emergency Response →
                </Link>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open);
                setAlertsOpen(false);
              }}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-white/5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-aurora-soft text-[11px] font-semibold text-[var(--color-text-primary)] ring-1 ring-white/10">
                {initials(displayName)}
              </span>
              <span className="hidden text-left xl:block">
                <span className="block text-sm font-medium leading-tight text-[var(--color-text-primary)]">
                  {displayName}
                </span>
                <span className="block text-[11px] leading-tight text-[var(--color-text-secondary)]">
                  {displayRole}
                </span>
              </span>
              <IconChevronDown
                width={14}
                height={14}
                className={cn(
                  'hidden text-[var(--color-text-secondary)] transition-transform duration-200 sm:block',
                  profileOpen && 'rotate-180'
                )}
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="polar-glass absolute right-0 top-full z-50 mt-2 w-64 p-1.5"
              >
                <div className="border-b border-white/5 px-3 pb-2 pt-2">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{displayName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {displayRole}{user?.email ? ` · ${user.email}` : ''}
                  </p>
                </div>
                <div className="p-1">
                  <Link
                    to="/app/settings"
                    onClick={closeAll}
                    role="menuitem"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors hover:bg-white/5"
                  >
                    <IconSettings width={16} height={16} className="text-[var(--color-text-secondary)]" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      closeAll();
                      logout();
                      navigate('/');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors hover:bg-white/5"
                  >
                    <IconLogout width={16} height={16} className="text-[var(--color-text-secondary)]" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
