import alovaInstance from '../../../shared/api/alovaInstance'

interface UserLoginData {
  email: string
  password: string
}

interface UserAuthResponse {
    id: number
    name: string
    email: string
    role: 'admin' | 'proveedor'
    access_token: string
}

export const userLoginApi = (data: UserLoginData) =>
  alovaInstance.Post<UserAuthResponse>('/token', data)

export const userLogoutApi = () => alovaInstance.Post<void>('/logout')

export const userMeApi = () => alovaInstance.Get<{ data: UserAuthResponse['data'] }>('/users/me')
