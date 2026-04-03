import type { OrderAdminStatus } from './orderAdmin'

export interface Batches {
  batches: OrderAdminBatch[]
  count: number
  pages: number
}

export interface OrderAdminBatch {
  id: number
  name: string
  file_count: number
  size_count: number
  product_count: string
  product_total_price: number | null
  created_at: string
  deadline: string | null
  delivery_time: string | null
  format: string | null
  embed_profile: string | null
  bit_depth: string | null
  color_mode: string | null
  resolution: string | null
  dimension: { width: string; height: string } | null
  preserve_mask: boolean
  preserve_layers: boolean
  preserve_original_layer: boolean
}

export type ProviderStatus = 'en_proceso' | 'finalizado'

export interface OrderAdminProvider {
  id: number
  name: string
  status: ProviderStatus
  date: string
  total_files: number
  total_size: string
  retouch_count: number
  cost_per_photo: number | null
  extra_cost: number | null
  deadline: string | null
}

export interface OrderCommentType {
  id: number
}

export interface OrderCommentItemType {
  id: number
  name: string
  created: string
  message: string
}

export interface OrderDetailType {
  id: number
  customer_id: number
  number: string
  name: string
  status: OrderAdminStatus
  created_at: string
  deadline: string | null
  file_size: number
  file_count: number
  batch_count: number
  conversations: OrderCommentItemType
}
