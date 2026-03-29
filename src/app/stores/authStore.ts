import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PreferencesData } from '@/application/auth/api/authApi'

// ---------------------------------------------------------------------------
// Role & user type definitions
// ---------------------------------------------------------------------------

export type UserRole = 'customer' | 'admin' | 'proveedor'
export type UserType = 'customer' | 'user'

// ---------------------------------------------------------------------------
// User interfaces per type
// ---------------------------------------------------------------------------

interface MembershipTier {
  id: number
  name: string
  payment_method: string
}

export interface CustomerUser {
  id: number
  username: string
  firstname: string
  lastname: string
  avatar?: string
  document?: string
  birth_date?: string
  address?: string
  address_number?: string
  city?: string
  state?: string
  country_iso?: string
  lang: string
  timezone?: string
  membership_tier: MembershipTier
  phones?: Array<{ id: number; phone: string; feature: boolean }>
  additional_emails?: Array<{
    id: number
    email: string
    feature: boolean
    verified_at: string | null
  }>
  preferences?: PreferencesData
  order_count?: number
  photo_count?: number
  email_notifications?: boolean
  privacy_accepted_at?: string | null
  newsletter_subscribed_at?: string | null
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'proveedor'
}

export type AuthUser = CustomerUser | AdminUser

export function isCustomerUser(user: AuthUser | null): user is CustomerUser {
  return user !== null && 'username' in user
}

export function isAdminUser(user: AuthUser | null): user is AdminUser {
  return user !== null && 'role' in user
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface AuthState {
  user: AuthUser | null
  token: string | null
  role: UserRole | null
  userType: UserType | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string, role: UserRole, userType: UserType) => void
  logout: () => void
  updateUser: (partial: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      userType: null,
      isAuthenticated: false,
      setAuth: (user, token, role, userType) => {
        localStorage.setItem('auth-token', token)
        set({ user, token, role, userType, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('auth-token')
        set({
          user: null,
          token: null,
          role: null,
          userType: null,
          isAuthenticated: false,
        })
      },
      updateUser: (partial) => {
        const currentUser = get().user
        if (!currentUser) return
        set({ user: { ...currentUser, ...partial } as AuthUser })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        role: state.role,
        userType: state.userType,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.token) {
          state.isAuthenticated = true
        }
      },
    },
  ),
)
