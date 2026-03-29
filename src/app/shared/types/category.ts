export interface Category {
  id: number
  name: string
}

export interface CategoryGroup {
  tag: string
  label: string
  categories: Category[]
}

export interface ProductItem {
  id: number
  name: string
  price: number
  price_provider: number
  duration_task: number
  value_type: string
  descriptions: {
    client: string
    admin?: string
    provider?: string
  }
}

export interface Product {
  id: number
  type: 'choices' | 'checkbox'
  name: string
  description: string
  items: ProductItem[]
}

export interface ProductOptions {
  id: number
  label: string
  description: string | null
  options: ProductItem[]
}
