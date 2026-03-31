import { userLoginApi, userLogoutApi } from '@/app/core/auth/api/userAuthApi'
import { useAuthStore } from '@/app/stores/authStore'
import type { UserRole } from '@/app/stores/authStore'


export async function loginUser(email: string, password: string) {
  const res = await userLoginApi({ email, password }).send()
  const { access_token, ...user } = res
  const role = user.role as UserRole
  useAuthStore.getState().setAuth(user, access_token, role, 'user')
  return user
}

export async function logout() {
  const { userType } = useAuthStore.getState()
  try {
    if (userType === 'user') {
      await userLogoutApi().send()
    } 
  } finally {
    useAuthStore.getState().logout()
  }
}

export function hasRole(role: UserRole): boolean {
  return useAuthStore.getState().role === role
}

export function isAdmin(): boolean {
  return hasRole('admin')
}


