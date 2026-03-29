import alovaInstance from './alovaInstance'

interface UserLoginData {
  email: string
  password: string
}

interface UserAuthResponse {
  data: {
    id: number
    name: string
    email: string
    role: 'admin' | 'proveedor'
    access_token: string
  }
}

export const userLoginApi = (data: UserLoginData) =>
  alovaInstance.Post<UserAuthResponse>('/users/token', data)

export const userLogoutApi = () => alovaInstance.Post<void>('/users/logout')

export const userMeApi = () => alovaInstance.Get<{ data: UserAuthResponse['data'] }>('/users/me')
