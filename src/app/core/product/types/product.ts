export interface ProductCategory {
  id: number
  name: string
}

export interface ProductItem {
  id: number
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

export interface ProductAdmin {
  id: number
  name: string
  description: string
  type: string
  price: number
  time: number
  sort_order: number
  categories: ProductCategory[]
  items: ProductItem[]
}

export interface ProductsAdminListResponse {
  products: ProductAdmin[]
  count: number
  pages: number
}
