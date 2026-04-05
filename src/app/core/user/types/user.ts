export interface User {
  id: number
  email: string
  firstname: string
  lastname: string
  document: string | null
  birth_date: string | null
  hire_date: string | null
  address: string | null
  role: string
}

export interface UsersListResponse {
  users: User[]
  count: number
  pages: number
}
