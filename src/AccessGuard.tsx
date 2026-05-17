import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore, isAdminUser } from '@/app/stores/authStore'
import type { RoleAccess } from '@/app/stores/authStore'

const ACCESS_ROUTES: Record<RoleAccess, string> = {
  PRODUCT: '/products',
  ROLE: '/roles',
}

const ROUTE_ACCESS: Array<{ prefix: string; access: RoleAccess }> = [
  { prefix: '/products', access: 'PRODUCT' },
  { prefix: '/categories', access: 'PRODUCT' },
  { prefix: '/roles', access: 'ROLE' },
]

function firstAllowedRoute(accesses: RoleAccess[]): string | null {
  for (const access of accesses) {
    const route = ACCESS_ROUTES[access]
    if (route) return route
  }
  return null
}

export default function AccessGuard() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { pathname } = useLocation()

  const isAdmin = isAdminUser(user)
  const role = isAdmin ? user.role : null
  const hasValidShape = !!role && typeof role === 'object' && Array.isArray(role.accesses)

  useEffect(() => {
    if (isAdmin && !hasValidShape) {
      logout()
    }
  }, [isAdmin, hasValidShape, logout])

  if (isAdmin && !hasValidShape) {
    return <Navigate to="/login" replace />
  }

  const accesses: RoleAccess[] = hasValidShape ? role!.accesses : []
  const fallback = firstAllowedRoute(accesses)

  if (pathname === '/' || pathname === '') {
    return fallback ? <Navigate to={fallback} replace /> : <Navigate to="/login" replace />
  }

  const required = ROUTE_ACCESS.find((r) => pathname.startsWith(r.prefix))

  if (!required) {
    return fallback ? <Navigate to={fallback} replace /> : <Navigate to="/login" replace />
  }

  if (!accesses.includes(required.access)) {
    return fallback ? <Navigate to={fallback} replace /> : <Navigate to="/login" replace />
  }

  return <Outlet />
}
