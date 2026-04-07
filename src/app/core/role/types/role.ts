export interface RoleAccess {
  id: number
  name: string
}

export interface RoleRestriction {
  only_provider: boolean
}

export interface Role {
  id: number
  name: string
  access?: RoleAccess[]
  restriction?: RoleRestriction
}

export interface RolesListResponse {
  roles: Role[]
  count: number
  pages: number
}

export interface RoleAccessListResponse {
  role_access: RoleAccess[]
}
