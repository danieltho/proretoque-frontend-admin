import { userLoginApi, userLogoutApi } from '@/app/core/auth/api/userAuthApi'
import { useAuthStore } from '@/app/stores/authStore'
import type { RoleAccess, AdminUser } from '@/app/stores/authStore'


export async function loginUser(email: string, password: string) {
  const res = (await userLoginApi({ email, password }).send()) as unknown as Record<
    string,
    unknown
  > & { access_token: string }
  console.log('[loginUser] raw response:', res)

  const { access_token, ...rest } = res

  const roleRaw = rest.role as
    | { name?: string; accesses?: string[]; access?: string[] }
    | string
    | undefined
  const topLevelAccess = rest.access as string[] | undefined

  const normalizedRole =
    roleRaw && typeof roleRaw === 'object'
      ? {
          name: roleRaw.name ?? '',
          accesses: roleRaw.accesses ?? roleRaw.access ?? topLevelAccess ?? [],
        }
      : {
          name: typeof roleRaw === 'string' ? roleRaw : '',
          accesses: topLevelAccess ?? [],
        }

  const user = { ...rest, role: normalizedRole } as unknown as AdminUser
  console.log('[loginUser] normalized user:', user)
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


