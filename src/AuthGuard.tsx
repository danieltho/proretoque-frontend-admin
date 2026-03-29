import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/core/auth/data/useAuth'
import { useAuthStore } from '@/app/stores/authStore'

export default function AuthGuard({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const hasHydrated = useAuthStore.persist.hasHydrated()

  if (!hasHydrated) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
