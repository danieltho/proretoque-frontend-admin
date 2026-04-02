import { useAuthStore } from '@/app/stores/authStore'

export function useAuth() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const userType = useAuthStore((s) => s.userType)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return {
    token,
    user,
    role,
    userType,
    isAuthenticated,
  }
}
