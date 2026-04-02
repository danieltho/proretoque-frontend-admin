import alovaInstance from '@/app/shared/api/alovaInstance'
import type { CategoryAdmin, CategoriesAdminListResponse } from '../types/category'

export const getCategoriesAdminApi = (page = 1, limit = 20) =>
  alovaInstance.Get<CategoriesAdminListResponse>('/admin/categories', {
    params: { page, limit },
    cacheFor: 0,
  })

export const getCategoryAdminApi = (id: number) =>
  alovaInstance.Get<{ data: CategoryAdmin }>(`/admin/categories/${id}`, { cacheFor: 0 })

export const createCategoryAdminApi = (data: { name: string }) =>
  alovaInstance.Post<{ data: CategoryAdmin }>('/admin/categories', data)

export const deleteCategoryAdminApi = (id: number) =>
  alovaInstance.Delete<void>(`/admin/categories/${id}`)
