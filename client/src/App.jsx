import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CargoMap from './pages/CargoMap.jsx';
import Inventory from './pages/Inventory.jsx';
import Personnel from './pages/Personnel.jsx';
import Emergency from './pages/Emergency.jsx';
import Settings from './pages/Settings.jsx';
import { useTheme } from './hooks/useTheme.js';

export default function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const { mode } = useTheme();

  // Landing always stays the immersive dark theme; the light/dark toggle
  // only affects the dashboard, per the "Corpo" spec (light + dark variants).
  const themeClass = isLanding ? 'landing-theme' : `dashboard-theme ${mode === 'dark' ? 'dark' : ''}`;

  return (
    <div className={themeClass}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/cargo" element={<CargoMap />} />
        <Route path="/dashboard/inventory" element={<Inventory />} />
        <Route path="/dashboard/personnel" element={<Personnel />} />
        <Route path="/dashboard/emergency" element={<Emergency />} />
        <Route path="/dashboard/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}
