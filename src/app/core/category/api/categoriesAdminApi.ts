import alovaInstance from '@/app/shared/api/alovaInstance'
import type { CategoryAdmin, CategoriesAdminListResponse } from '../types/category'

export const getCategoriesAdminApi = (page = 1, limit = 20) =>
  alovaInstance.Get<CategoriesAdminListResponse>('/categories', {
    params: { page, limit },
    cacheFor: 0,
  })

export const getCategoryAdminApi = (id: number) =>
  alovaInstance.Get<{ data: CategoryAdmin }>(`/categories/${id}`, { cacheFor: 0 })

export const createCategoryAdminApi = (data: { name: string }) =>
  alovaInstance.Post<{ data: CategoryAdmin }>('/categories', {
    translations: { es: { name: data.name } },
  })

export interface UpdateCategoryAdminPayload {
  translations?: Record<string, { name: string }>
  position?: number
}

export const updateCategoryAdminApi = (id: number, data: UpdateCategoryAdminPayload) =>
  alovaInstance.Put<{ data: CategoryAdmin }>(`/categories/${id}`, data)

export const sortCategoriesAdminApi = (categoryIds: number[]) =>
  alovaInstance.Patch('/categories/sort', { category_ids: categoryIds })

export const deleteCategoryAdminApi = (id: number) =>
  alovaInstance.Delete<void>(`/categories/${id}`)
