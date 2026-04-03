import alovaInstance from '@/app/shared/api/alovaInstance'
import type { Provider, ProvidersListResponse } from '../types/provider'

export const getProvidersApi = (page = 1, search = '') =>
  alovaInstance.Get<ProvidersListResponse>('/backend/providers', {
    params: { page, ...(search ? { search } : {}) },
    cacheFor: 0,
  })

export const getProviderApi = (id: number) =>
  alovaInstance.Get<{ provider: Provider }>(`/backend/providers/${id}`, { cacheFor: 0 })

export const createProviderApi = (data: {
  username: string
  firstname: string
  lastname: string
  email: string
  company?: string
  password: string
}) => alovaInstance.Post<{ provider: Provider }>('/backend/providers', data)

export const updateProviderApi = (
  id: number,
  data: {
    username?: string
    firstname?: string
    lastname?: string
    email?: string
    company?: string
  },
) => alovaInstance.Put<{ provider: Provider }>(`/backend/providers/${id}`, data)

export const deleteProviderApi = (id: number) =>
  alovaInstance.Delete<void>(`/backend/providers/${id}`)
