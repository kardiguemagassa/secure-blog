import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'
import type { Role } from '../types/api'

export function ProtectedRoute({ role }: { role?: Role }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <p>Loading…</p>
  }

  if (!isAuthenticated) {
    // on mémorise la page demandée pour y revenir après le login
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
