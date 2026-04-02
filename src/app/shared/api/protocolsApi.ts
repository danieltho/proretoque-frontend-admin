import alovaInstance from '@/app/shared/api/alovaInstance'
import type { Protocol, ProtocolMedia } from '@/app/shared/types/protocol'

export type { Protocol, ProtocolMedia }

export const getProtocolsApi = () =>
  alovaInstance.Get<{ protocols: Protocol[] }>('/protocols', { cacheFor: 0 })

export const getProtocolApi = (id: number) =>
  alovaInstance.Get<{ protocol: Protocol }>(`/protocols/${id}`, { cacheFor: 0 })

export const createProtocolApi = (data: { name: string }) =>
  alovaInstance.Post<{ protocol: Protocol }>('/protocols', data)

export const syncProtocolProductItemsApi = (
  protocolId: number,
  data: { product_item_ids: number[] },
) => alovaInstance.Post<{ protocol: Protocol }>(`/protocols/${protocolId}/product-items`, data)

export const uploadProtocolMediaApi = (
  protocolId: number,
  _collection: 'original' | 'example' | 'resource',
  formData: FormData,
) => alovaInstance.Post<{ media: ProtocolMedia }>(`/protocols/${protocolId}/media`, formData)
