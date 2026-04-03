export interface ProductCategory {
  id: number
  name: string
}

export interface ProductAdmin {
  id: number
  name: string
  sort_order: number
  categories: ProductCategory[]
}

export interface ProductsAdminListResponse {
  products: ProductAdmin[]
  count: number
  pages: number
}
