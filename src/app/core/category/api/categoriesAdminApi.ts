import alovaInstance from '@/app/shared/api/alovaInstance'
import type { CategoryAdmin, CategoriesAdminListResponse } from '../types/category'

export const getCategoriesAdminApi = (page = 1, limit = 20) =>
  alovaInstance.Get<CategoriesAdminListResponse>('/backend/categories', {
    params: { page, limit },
    cacheFor: 0,
  })

export const getCategoryAdminApi = (id: number) =>
  alovaInstance.Get<{ data: CategoryAdmin }>(`/backend/categories/${id}`, { cacheFor: 0 })

export const createCategoryAdminApi = (data: { name: string }) =>
  alovaInstance.Post<{ data: CategoryAdmin }>('/backend/categories', data)

export const updateCategoryAdminApi = (id: number, data: { name: string }) =>
  alovaInstance.Put<{ data: CategoryAdmin }>(`/backend/categories/${id}`, data)

export const sortCategoriesAdminApi = (categoryIds: number[]) =>
  alovaInstance.Patch('/backend/categories/sort', { category_ids: categoryIds })

export const deleteCategoryAdminApi = (id: number) =>
  alovaInstance.Delete<void>(`/backend/categories/${id}`)
