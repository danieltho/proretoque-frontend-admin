export interface RoleAccess {
  id: number
  name: string
}

export interface Role {
  id: number
  name: string
  access: RoleAccess[]
}

export interface RolesListResponse {
  roles: Role[]
  count: number
  pages: number
}

export interface RoleAccessListResponse {
  role_access: RoleAccess[]
}
