import alovaInstance from '@/app/shared/api/alovaInstance'
import type { ProductAdmin, ProductsAdminListResponse } from '../types/product'

export const getProductsAdminApi = (page = 1, limit = 20) =>
  alovaInstance.Get<ProductsAdminListResponse>('/admin/products', {
    params: { page, limit },
    cacheFor: 0,
  })

export const getProductAdminApi = (id: number) =>
  alovaInstance.Get<{ data: ProductAdmin }>(`/admin/products/${id}`, { cacheFor: 0 })

export const deleteProductAdminApi = (id: number) =>
  alovaInstance.Delete<void>(`/admin/products/${id}`)
