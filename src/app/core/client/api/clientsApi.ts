import alovaInstance from '@/app/shared/api/alovaInstance'
import type { Client, ClientsListResponse } from '../types/client'

export const getClients = (page = 1, search = '') =>
  alovaInstance.Get<ClientsListResponse>('/backend/clients', {
    params: { page, ...(search ? { search } : {}) },
    cacheFor: 0,
  })

export const getClientApi = (id: number) =>
  alovaInstance.Get<{ data: Client }>(`/backend/clients/${id}`, { cacheFor: 0 })

export const postClientApi = () =>
  alovaInstance.Post<{ data: Client }>(`/backend/clients`, { cacheFor: 0 })
  
export const putClientApi = (id: number) =>
  alovaInstance.Put<{ data: Client }>(`/backend/clients/${id}`, { cacheFor: 0 })

export const deleteClientApi = (id: number) =>
  alovaInstance.Delete<void>(`/backend/clients/${id}`)
