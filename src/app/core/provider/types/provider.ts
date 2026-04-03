export interface Provider {
  id: number
  username: string
  firstname: string
  lastname: string
  email: string
  company: string | null
  deleted_at: string | null
}

export interface ProvidersListResponse {
  providers: Provider[]
  count: number
  pages: number
}
