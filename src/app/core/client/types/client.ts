export interface MembershipTier {
  id: number
  name: string
  payment_method: string
}

export type MembershipLevel = 'Esencial' | 'Profesional' | 'Experto' | 'Premium'

export interface Client {
  id: number
  username: string
  email: string
  firstname: string
  lastname: string
  membership_tier: MembershipTier
}

export interface ClientsListResponse {
  customers: Client[]
  count: number
  pages: number
}
