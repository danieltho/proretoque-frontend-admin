export interface CategoryAdmin {
  id: number
  name: string
  sort_order: number
  duration_task: number
  price: number
}

export interface CategoriesAdminListResponse {
  categories: CategoryAdmin[]
  count: number
  page: number
}
