export interface UserRole {
  id: number
  name: string
}

export interface User {
  id: number
  email: string
  firstname: string
  lastname: string
  document: string | null
  birth_date: string | null
  hire_date: string | null
  address: string | null
  role: UserRole
}

export interface UsersListResponse {
  users: User[]
  count: number
  pages: number
}
