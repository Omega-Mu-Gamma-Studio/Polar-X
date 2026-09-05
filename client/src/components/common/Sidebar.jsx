import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../utils/constants.js';

const ICONS = {
  grid: (
    <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" strokeLinejoin="round" />
  ),
  map: <path d="M4 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM10 4v14M16 6v14" strokeLinejoin="round" />,
  box: <path d="M3 8l9-4 9 4-9 4-9-4zM3 8v9l9 4M21 8v9l-9 4M12 12v9" strokeLinejoin="round" />,
  users: <path d="M8 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3 2-5 5-5s5 2 5 5M16 11a3 3 0 100-6M21 20c0-3-1.5-4.5-4-5" strokeLinejoin="round" />,
  alert: <path d="M12 2L2 20h20L12 2zM12 9v5M12 17h.01" strokeLinejoin="round" />,
  settings: <path d="M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.2-1.6l2-1.5-2-3.4-2.3.8a7 7 0 00-2.7-1.5L13.4 2h-2.8l-.4 2.8a7 7 0 00-2.7 1.5l-2.3-.8-2 3.4 2 1.5A7 7 0 005 12a7 7 0 00.2 1.6l-2 1.5 2 3.4 2.3-.8a7 7 0 002.7 1.5l.4 2.8h2.8l.4-2.8a7 7 0 002.7-1.5l2.3.8 2-3.4-2-1.5c.13-.5.2-1 .2-1.6z" strokeLinejoin="round" />,
};

function Icon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {ICONS[name]}
    </svg>
  );
}

export default function Sidebar() {
  return (
    <aside className="polar-sidebar w-56 shrink-0 min-h-screen flex flex-col py-6 px-3">
      <div className="px-3 mb-8">
        <p className="font-display text-lg tracking-tight">PolarX</p>
        <p className="text-xs opacity-60">Command Center</p>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isActive ? 'active' : 'opacity-75'}`
            }
          >
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
