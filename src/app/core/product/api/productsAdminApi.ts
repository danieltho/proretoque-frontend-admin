import alovaInstance from '@/app/shared/api/alovaInstance'
import type { ProductAdmin, ProductsAdminListResponse } from '../types/product'

export const getProductsAdminApi = (page = 1) =>
  alovaInstance.Get<ProductsAdminListResponse>('/backend/products', {
    params: { page },
    cacheFor: 0,
  })

export const getProductAdminApi = (id: number) =>
  alovaInstance.Get<{ data: ProductAdmin }>(`/backend/products/${id}`, { cacheFor: 0 })

export const deleteProductAdminApi = (id: number) =>
  alovaInstance.Delete<void>(`/backend/products/${id}`)
