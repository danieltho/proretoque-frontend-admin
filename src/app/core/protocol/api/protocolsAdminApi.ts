import alovaInstance from '@/app/shared/api/alovaInstance'
import type { ProtocolAdmin, ProtocolsAdminListResponse } from '../types/protocol'

export const getProtocolsAdminApi = (page = 1) =>
  alovaInstance.Get<ProtocolsAdminListResponse>('/backend/protocols', {
    params: { page },
    cacheFor: 0,
  })

export const getProtocolAdminApi = (id: number) =>
  alovaInstance.Get<{ data: ProtocolAdmin }>(`/backend/protocols/${id}`, { cacheFor: 0 })

export const deleteProtocolAdminApi = (id: number) =>
  alovaInstance.Delete<void>(`/backend/protocols/${id}`)
