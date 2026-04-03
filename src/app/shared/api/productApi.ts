import alovaInstance from './alovaInstance'
import type { Category, ProductOptions } from '@/app/shared/types/category'

interface CategoriesResponse {
  categories: Category[]
}

interface ProductsResponse {
  products: ProductOptions[]
}

export interface DeliveryOptionsResponse {
  delivery_times: { value: string; label: string }[]
  formats: string[]
  embed_profiles: string[]
  bit_depths: string[]
  color_modes: string[]
}

export const getCategoriesApi = () =>
  alovaInstance.Get<CategoriesResponse>('/products/categories', { cacheFor: 0 })

export const getCategoryProductsApi = (categoryId: number) =>
  alovaInstance.Get<ProductsResponse>(`/products/categories/${categoryId}/products`, {
    cacheFor: 0,
  })

export const getCategoriesByTagApi = (tagName: string) =>
  alovaInstance.Get<CategoriesResponse>(`/products/categories/tag/${tagName}`, { cacheFor: 0 })

export const getDeliveryOptionsApi = () =>
  alovaInstance.Get<DeliveryOptionsResponse>(`/products/delivery-options`, { cacheFor: 1 })
