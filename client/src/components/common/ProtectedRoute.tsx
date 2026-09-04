import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingState from './LoadingState';

/**
 * Guards the /app tree (Phase 7): while a stored token is being validated on
 * boot we show a loading state (never a blank flash); logged-out users are
 * redirected to /login with their intended destination preserved in state.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)]">
        <LoadingState label="Restoring session…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <>{children}</>;
}