import alovaInstance from '@/app/shared/api/alovaInstance'
import type { Batches, OrderDetailType } from '../types/orderDetailType'
import type { OrderAdminStatus } from '../types/orderAdmin'
import type { MediaItem } from '@/app/shared/types/media'
import type { MediaCollection } from '@/app/shared/types/protocol'

export interface BatchMediaFile {
  id: number
  file_name: string
  url: string
  preview_url: string | null
  size: number
  mime_type: string
  collection: MediaCollection
}

export type BatchMediaResponse = Record<MediaCollection, BatchMediaFile[]>

export const getOrderDetail = (id: number) =>
  alovaInstance.Get<OrderDetailType>(`/backend/orders/${id}`, { cacheFor: 0 })

export const createOrderAdminApi = (data: { name: string; customer_id: number }) =>
  alovaInstance.Post<OrderDetailType>('/backend/orders', data)

export const getOrderAdminBatchesApi = (
  orderId: number,
  page = 1,
  sortBy = 'sort_order',
  sortOrder = 'asc',
) =>
  alovaInstance.Get<Batches>(`/backend/orders/${orderId}/batches`, {
    cacheFor: 0,
    params: { page, sort_by: sortBy, sort_order: sortOrder },
  })

export const sortOrderAdminBatchesApi = (orderId: number, batchIds: number[]) =>
  alovaInstance.Patch(`/backend/orders/${orderId}/batches/sort`, { batch_ids: batchIds })

export const updateBatchNameApi = (batchId: number, name: string) =>
  alovaInstance.Patch(`/backend/orders/batch/${batchId}`, { name })

export const getBatchMediaApi = (batchId: number) =>
  alovaInstance.Get<BatchMediaResponse>(`/backend/orders/batch/${batchId}/media`, { cacheFor: 0 })

export const deleteBatchMediaApi = (batchId: number, mediaId: number) =>
  alovaInstance.Delete(`/backend/orders/batch/${batchId}/media/${mediaId}`)

export const saveBatchMediaApi = (
  batchId: number,
  tempMedia: { temp_id: string; file_name: string; collection: MediaCollection }[],
) => alovaInstance.Post(`/backend/orders/batch/${batchId}/media`, { media: tempMedia })

export const getBatchProductsApi = (batchId: number) =>
  alovaInstance.Get<{ product_item_ids: number[] }>(`/backend/orders/batch/${batchId}/products`, {
    cacheFor: 0,
  })

export const saveBatchProductsApi = (batchId: number, productItemIds: number[]) =>
  alovaInstance.Post(`/backend/orders/batch/${batchId}/products`, {
    product_item_ids: productItemIds,
  })

export interface BatchDeliveryOptionsPayload {
  delivery_time?: string
  format?: string
  embed_profile?: string
  bit_depth?: string
  color_mode?: string
  resolution?: string
  dimension?: { width: string; height: string } | null
  preserve_mask?: boolean
  preserve_layers?: boolean
  preserve_original_layer?: boolean
}

export const getBatchDeliveryOptionsApi = (batchId: number) =>
  alovaInstance.Get<BatchDeliveryOptionsPayload>(
    `/backend/orders/batch/${batchId}/delivery-options`,
    { cacheFor: 0 },
  )

export const saveBatchDeliveryOptionsApi = (
  batchId: number,
  data: BatchDeliveryOptionsPayload,
) => alovaInstance.Put(`/backend/orders/batch/${batchId}/delivery-options`, data)

export const createBatchAdminApi = (orderId: number, name: string) =>
  alovaInstance.Post<{ batch: { id: number } }>(`/backend/orders/${orderId}/batches`, { name })

export interface OrderProvidersResponse {
  providers: import('../types/orderDetailType').OrderAdminProvider[]
}

export const getOrderProvidersApi = (orderId: number) =>
  alovaInstance.Get<OrderProvidersResponse>(`/backend/orders/${orderId}/providers`, { cacheFor: 0 })

export const addOrderProviderApi = (orderId: number, providerId: number) =>
  alovaInstance.Post(`/backend/orders/${orderId}/providers`, { provider_id: providerId })

export const removeOrderProviderApi = (orderId: number, providerId: number) =>
  alovaInstance.Delete(`/backend/orders/${orderId}/providers/${providerId}`)

export interface BatchImage {
  id: number
  file_name: string
  url: string
  preview_url: string | null
  assigned_provider_id: number | null
}

export interface BatchImagesResponse {
  images: BatchImage[]
  total: number
  unassigned: number
}

export const getBatchImagesApi = (batchId: number) =>
  alovaInstance.Get<BatchImagesResponse>(`/backend/orders/batch/${batchId}/images`, { cacheFor: 0 })

export interface BatchRetouchItem {
  id: number
  name: string
  type: string
  duration: number
}

export const getBatchRetouchesApi = (batchId: number) =>
  alovaInstance.Get<{ retouches: BatchRetouchItem[] }>(
    `/backend/orders/batch/${batchId}/retouches`,
    { cacheFor: 0 },
  )

export const assignProviderApi = (
  orderId: number,
  data: {
    provider_id: number
    batch_id: number
    image_ids: number[]
    retouch_ids: number[]
    cost_per_photo: number | null
    extra_cost: number | null
  },
) => alovaInstance.Post(`/backend/orders/${orderId}/providers/assign`, data)

export const updateOrderAdminApi = (
  id: number,
  data: {
    name?: string
    customer_id?: number
    status?: OrderAdminStatus
    payment_method?: string
    coupon_code?: string
    deadline?: string
  },
) => alovaInstance.Put<OrderDetailType>(`/backend/orders/${id}`, data)
