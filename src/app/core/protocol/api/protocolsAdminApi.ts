import alovaInstance from '@/app/shared/api/alovaInstance'
import type { ProtocolAdmin, ProtocolsAdminListResponse } from '../types/protocol'

export const getProtocolsAdminApi = (page = 1, limit = 20) =>
  alovaInstance.Get<ProtocolsAdminListResponse>('/admin/protocols', {
    params: { page, limit },
    cacheFor: 0,
  })

export const getProtocolAdminApi = (id: number) =>
  alovaInstance.Get<{ data: ProtocolAdmin }>(`/admin/protocols/${id}`, { cacheFor: 0 })

export const deleteProtocolAdminApi = (id: number) =>
  alovaInstance.Delete<void>(`/admin/protocols/${id}`)
