import alovaInstance from '@/app/shared/api/alovaInstance'

interface LoginData {
  username: string
  password: string
}

interface RegisterData {
  username: string
  password: string
  password_confirmation: string
  country_iso?: string
  email_notifications?: boolean
  privacy_accepted_at?: string
  newsletter_subscribed_at?: string
}

interface MembershipTier {
  id: number
  name: string
  payment_method: string
}

interface AuthResponse {
  id: number
  username: string
  firstname: string
  lastname: string
  lang: string
  access_token: string
  membership_tier: MembershipTier
  avatar?: string
  timezone?: string
  document?: string
  birth_date?: string
  address?: string
  address_number?: string
  city?: string
  state?: string
  country_iso?: string
  order_count?: number
  photo_count?: number
  email_notifications?: boolean
  privacy_accepted_at?: string | null
  newsletter_subscribed_at?: string | null
}

interface UpdateProfileData {
  username?: string
  firstname?: string
  lastname?: string
  document?: string
  birth_date?: string
  address?: string
  address_number?: string
  city?: string
  state?: string
  country_iso?: string
  lang?: string
  timezone?: string
  email_notifications?: boolean
  privacy_accepted_at?: string | null
  newsletter_subscribed_at?: string | null
}

export const loginApi = (data: LoginData) => alovaInstance.Post<AuthResponse>('/token', data)

export const registerApi = (data: RegisterData) =>
  alovaInstance.Post<AuthResponse>('/customers/register', data)

export const logoutApi = () => alovaInstance.Post<void>('/customers/logout')

export const getMeApi = () => alovaInstance.Get<{ user: AuthResponse }>('/customers/me')

export const updateProfileApi = (data: UpdateProfileData) =>
  alovaInstance.Put<{ data: AuthResponse }>('/customers/me', data)

export const uploadAvatarApi = (file: File) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return alovaInstance.Put<{ data: AuthResponse }>('/customers/me', formData)
}

export const addPhoneApi = (phone: string) =>
  alovaInstance.Post<{ data: { id: number; phone: string; feature: boolean } }>(
    '/customers/me/phones',
    { phone },
  )

export const removePhoneApi = (id: number) => {
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid phone ID')
  return alovaInstance.Delete<void>(`/customers/me/phones/${id}`)
}

export const setDefaultPhoneApi = (id: number) => {
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid phone ID')
  return alovaInstance.Put<{ data: { id: number; phone: string; feature: boolean } }>(
    `/customers/me/phones/${id}/feature`,
  )
}

export const addEmailApi = (email: string) =>
  alovaInstance.Post<{
    data: { id: number; email: string; feature: boolean; verified_at: string | null }
  }>('/customers/me/emails', { email })

export const removeEmailApi = (id: number) => {
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid email ID')
  return alovaInstance.Delete<void>(`/customers/me/emails/${id}`)
}

export const setDefaultEmailApi = (id: number) => {
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid email ID')
  return alovaInstance.Put<{
    data: { id: number; email: string; feature: boolean; verified_at: string | null }
  }>(`/customers/me/emails/${id}/feature`)
}

export type PreferenceItem =
  | { name: string; is_checked: boolean }
  | { name: string; other: string | null }

export type PreferencesData = Record<string, PreferenceItem[]>

export const getPreferencesApi = () =>
  alovaInstance.Get<{ data: PreferencesData }>('/customers/me/preferences', {
    cacheFor: 0,
  })

export const savePreferencesApi = (prefs: Record<string, boolean | string | null>) =>
  alovaInstance.Put<{ data: PreferencesData }>('/customers/me/preferences', prefs)

export type AboutItem =
  | { name: string; is_checked: boolean }
  | { name: string; other: string | null }

export type AboutData = {
  brand: AboutItem[]
  photg: AboutItem[]
  photo_studio: string
  marketplace: string
  marketing: string
  other: string | null
  phot_amount: { options: string[]; value: string }
  frequency: { options: string[]; value: string; other: string | null }
  referral_source: string
}

export const getAboutApi = () =>
  alovaInstance.Get<{ data: AboutData }>('/customers/me/about', { cacheFor: 0 })

export const saveAboutApi = (data: Record<string, boolean | string | null>) =>
  alovaInstance.Put<{ data: AboutData }>('/customers/me/about', data)

export const changePasswordApi = (data: {
  current_password: string
  password: string
  password_confirmation: string
}) => alovaInstance.Put<void>('/customers/me/password', data)
