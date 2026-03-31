import alovaInstance from '@/app/shared/api/alovaInstance'
import type { BatchDetail, BatchProgress, MoveMediaResponse } from '../types/order'

interface BatchResponse {
  batch: BatchDetail
}

export const createBatchApi = (orderId: number, formData: FormData) =>
  alovaInstance.Post<BatchResponse>(`/orders/${orderId}/batch`, formData)

export const getBatchApi = (batchId: number) =>
  alovaInstance.Get<BatchResponse>(`/orders/batch/${batchId}`, { cacheFor: 0 })

export const getBatchProgressApi = (batchId: number) =>
  alovaInstance.Get<BatchProgress>(`/orders/batch/${batchId}/progress`, { cacheFor: 0 })

export const uploadBatchImagesApi = (batchId: number, formData: FormData) =>
  alovaInstance.Post<BatchResponse>(`/orders/batch/${batchId}/images`, formData)

export const setBatchProductsApi = (batchId: number, data: { products: number[] }) =>
  alovaInstance.Post<BatchResponse>(`/orders/batch/${batchId}/products`, data)

export const deleteMediaApi = (batchId: number, mediaId: number) =>
  alovaInstance.Delete<void>(`/orders/batch/${batchId}/media/${mediaId}`)

export const updateMediaApi = (batchId: number, mediaId: number, formData: FormData) =>
  alovaInstance.Post<BatchResponse>(`/orders/batch/${batchId}/media/${mediaId}`, formData)

export const moveMediaApi = (batchId: number, mediaId: number, targetBatchId: number) =>
  alovaInstance.Patch<MoveMediaResponse>(`/orders/batch/${batchId}/media/${mediaId}/move`, {
    target_batch_id: targetBatchId,
  })
