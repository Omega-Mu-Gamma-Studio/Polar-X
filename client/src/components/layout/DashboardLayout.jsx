import Sidebar from '../common/Sidebar.jsx';
import Navbar from '../common/Navbar.jsx';

export default function DashboardLayout({ children, alertCount = 0 }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar alertCount={alertCount} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
