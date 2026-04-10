import alovaInstance from '@/app/shared/api/alovaInstance'
import { buildFilterParams, type Filters } from '@/app/shared/utils/filters'
import type { User, UsersListResponse } from '../types/user'

export const getUsersApi = (page = 1, filters?: Filters) =>
  alovaInstance.Get<UsersListResponse>('/backend/users', {
    params: { page, ...buildFilterParams(filters ?? {}) },
    cacheFor: 0,
  })

export const getUserApi = (id: number) =>
  alovaInstance.Get<User>(`/backend/users/${id}/detail`, { cacheFor: 0 })

export const createUserApi = (data: {
  email: string
  password: string
  password_confirmation: string
  firstname: string
  lastname: string
  document?: string
  birth_date?: string
  hire_date?: string
  address?: string
  role: string
}) => alovaInstance.Post<{ user: User }>('/backend/users', data)

export const updateUserApi = (
  id: number,
  data: {
    email?: string
    password?: string
    password_confirmation?: string
    firstname?: string
    lastname?: string
    document?: string
    birth_date?: string
    hire_date?: string
    address?: string
    role?: string
  },
) => alovaInstance.Put<{ user: User }>(`/backend/users/${id}`, data)

export const deleteUserApi = (id: number) =>
  alovaInstance.Delete<void>(`/backend/users/${id}`)
