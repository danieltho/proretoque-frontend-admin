import { userLoginApi, userLogoutApi } from '@/app/core/auth/api/userAuthApi'
import { useAuthStore } from '@/app/stores/authStore'
import type { RoleAccess, AdminRole, AdminUser } from '@/app/stores/authStore'

// Shape the backend may actually return for the login response. Kept looser than
// the documented contract because the role can arrive as an object, a plain
// string, or with the accesses promoted to the top level.
interface RawLoginResponse {
  access_token: string
  id: number
  name: string
  email: string
  role?: { name?: string; accesses?: RoleAccess[]; access?: RoleAccess[] } | string
  access?: RoleAccess[]
}

export async function loginUser(email: string, password: string) {
  const res = (await userLoginApi({ email, password }).send()) as RawLoginResponse

  const { access_token, role: roleRaw, access: topLevelAccess, id, name } = res

  const normalizedRole: AdminRole =
    roleRaw && typeof roleRaw === 'object'
      ? {
          name: roleRaw.name ?? '',
          accesses: roleRaw.accesses ?? roleRaw.access ?? topLevelAccess ?? [],
        }
      : {
          name: typeof roleRaw === 'string' ? roleRaw : '',
          accesses: topLevelAccess ?? [],
        }

  const user: AdminUser = { id, name, email: res.email, role: normalizedRole }
  useAuthStore.getState().setAuth(user, access_token, 'user')
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

export function hasAccess(access: RoleAccess): boolean {
  const user = useAuthStore.getState().user
  if (!user || !('role' in user) || typeof user.role !== 'object') return false
  return user.role.accesses?.includes(access) ?? false
}


