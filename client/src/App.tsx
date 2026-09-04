import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { LayoutProvider } from '@/context/LayoutContext';
import { AuthProvider } from '@/context/AuthContext';
import AppLayout from '@/components/common/AppLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoadingState from '@/components/common/LoadingState';
import ErrorPage from '@/pages/ErrorPage';

// Route-level code splitting — pages stay small so this is fast and keeps the
// shell interactive while a module loads (LoadingState is the Suspense fallback).
const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Stations = lazy(() => import('@/pages/Stations'));
const Cargo = lazy(() => import('@/pages/Cargo'));
const Inventory = lazy(() => import('@/pages/Inventory'));
const Personnel = lazy(() => import('@/pages/Personnel'));
const Emergency = lazy(() => import('@/pages/Emergency'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// Full-screen fallback for the public top-level routes while their chunk loads.
// These routes have no AppLayout (no <Suspense> wrapper), so without this
// boundary a lazy() element that suspends during a synchronous navigation
// (e.g. clicking "Sign out" to return to the landing page) throws React's
// "A component suspended while responding to synchronous input" error.
function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)]">
      <LoadingState label="Loading…" />
    </div>
  );
}

function withRouteSuspense(element: ReactNode): ReactNode {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

// Phase 6: the authenticated app lives under /app (protected since Phase 7) so
// the public landing page can own `/`. Phase 7 added /login + /register as
// public routes and wrapped the /app tree in ProtectedRoute.
const router = createBrowserRouter([
  {
    path: '/',
    element: withRouteSuspense(<Landing />),
    errorElement: <ErrorPage />,
  },
  {
    path: '/login',
    element: withRouteSuspense(<Login />),
    errorElement: <ErrorPage />,
  },
  {
    path: '/register',
    element: withRouteSuspense(<Register />),
    errorElement: <ErrorPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'stations', element: <Stations /> },
      { path: 'cargo', element: <Cargo /> },
      { path: 'inventory', element: <Inventory /> },
      { path: 'personnel', element: <Personnel /> },
      { path: 'emergency', element: <Emergency /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/app" replace /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <LayoutProvider>
        <RouterProvider router={router} />
      </LayoutProvider>
    </AuthProvider>
  );
}