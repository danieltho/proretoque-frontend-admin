import { loginApi, logoutApi } from '@/application/auth/api/authApi'
import { userLoginApi, userLogoutApi } from '@/shared/api/userAuthApi'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/stores/authStore'

export async function loginCustomer(username: string, password: string) {
  const res = await loginApi({ username, password }).send()
  const { access_token, ...user } = res
  useAuthStore.getState().setAuth(user, access_token, 'customer', 'customer')
  return user
}

export async function loginUser(email: string, password: string) {
  const res = await userLoginApi({ email, password }).send()
  const { access_token, ...user } = res.data
  const role = user.role as UserRole
  useAuthStore.getState().setAuth(user, access_token, role, 'user')
  return user
}

export async function logout() {
  const { userType } = useAuthStore.getState()
  try {
    if (userType === 'user') {
      await userLogoutApi().send()
    } else {
      await logoutApi().send()
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

export function isProvider(): boolean {
  return hasRole('proveedor')
}

export function isCustomer(): boolean {
  return hasRole('customer')
}
