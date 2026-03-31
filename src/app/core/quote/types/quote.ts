export type QuoteAdminStatus = 'pendiente' | 'enviado' | 'aceptado'

export interface QuoteAdmin {
  id: number
  number: string
  name: string
  customer_name: string
  delivery_time: string
  images_count: number
  created_at: string
  deadline: string | null
  coupon: string | null
  total: number
  status: QuoteAdminStatus
}

export interface QuotesAdminListResponse {
  quotes: QuoteAdmin[]
  count: number
  page: number
}
