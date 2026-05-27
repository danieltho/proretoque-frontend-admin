import alovaInstance from '../../../shared/api/alovaInstance'

interface UserLoginData {
  email: string
  password: string
}

export type RoleAccess = 'PRODUCT' | 'ROLE' | (string & {})

interface RoleResponse {
  name: string
  accesses: RoleAccess[]
}

interface UserAuthResponse {
  id: number
  name: string
  email: string
  lang: string
  role: RoleResponse
  access_token: string
  token_type: string
  expires_in: number
}

export const userLoginApi = (data: UserLoginData) =>
  alovaInstance.Post<UserAuthResponse>('/token', data)

export const userLogoutApi = () => alovaInstance.Post<void>('/logout')

export const userMeApi = () => alovaInstance.Get<UserAuthResponse>('/users/me')
