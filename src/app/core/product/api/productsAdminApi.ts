import alovaInstance from '@/app/shared/api/alovaInstance'
import { buildFilterParams, type Filters } from '@/app/shared/utils/filters'
import type { ProductAdmin, ProductsAdminListResponse, ProductItem } from '../types/product'

interface ProductItemPayload {
  id?: number
  name: string
  description: string
  tooltip: string
  description_provider: string
  description_postpro: string
  price: number
  duration_task: number
  lang: string
  sort_order: number
}

interface ProductPayload {
  name: string
  description?: string
  category_ids: number[]
  type: string
  price: number
  time: number
  items?: ProductItemPayload[]
}

export const getProductsAdminApi = (pages = 1, filters?: Filters) =>
  alovaInstance.Get<ProductsAdminListResponse>('/backend/products', {
    params: { pages, ...buildFilterParams(filters ?? {}) },
    cacheFor: 0,
  })

export const getProductAdminApi = (id: number) =>
  alovaInstance.Get<ProductAdmin>(`/backend/products/${id}`, { cacheFor: 0 })

export const createProductAdminApi = (data: ProductPayload) =>
  alovaInstance.Post<{ product: ProductAdmin }>('/backend/products', data)

export const updateProductAdminApi = (id: number, data: ProductPayload) =>
  alovaInstance.Put<{ product: ProductAdmin }>(`/backend/products/${id}`, data)

export const sortProductItemsApi = (productId: number, itemIds: number[]) =>
  alovaInstance.Patch(`/backend/products/${productId}/items/sort`, { item_ids: itemIds })

export const deleteProductAdminApi = (id: number) =>
  alovaInstance.Delete<void>(`/backend/products/${id}`)
