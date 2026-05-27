export interface CategoryAdmin {
  id: number
  name: string
  position: number
}

export interface CategoriesAdminListResponse {
  categories: CategoryAdmin[]
  count: number
  page: number
}
