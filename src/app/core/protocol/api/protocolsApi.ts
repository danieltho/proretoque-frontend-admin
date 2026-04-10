import alovaInstance from '@/app/shared/api/alovaInstance'
import type { ProtocolAdmin, ProtocolsAdminListResponse } from '../types/protocol'

interface ProtocolFilters {
  name?: string
  status?: string
}

export const getProtocols = (page = 1, filters?: ProtocolFilters) =>
  alovaInstance.Get<ProtocolsAdminListResponse>('/backend/protocols', {
    params: { page, ...filters },
    cacheFor: 0,
  })

export const getProtocol = (id: number) =>
  alovaInstance.Get<{ data: ProtocolAdmin }>(`/backend/protocols/${id}`, { cacheFor: 0 })

export const deleteProtocol = (id: number) => alovaInstance.Delete<void>(`/backend/protocols/${id}`)
