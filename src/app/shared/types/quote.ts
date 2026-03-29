import type { TempMedia } from '@/shared/types/protocol'

export type QuoteStatus = 'draft' | 'pending' | 'in_progress' | 'sample_accepted' | 'quote_accepted'

export type QuoteAction = 'requires_samples' | 'samples_sent' | 'requires_quote' | 'quote_sent'

export interface CreateQuotePayload {
  product_item_ids?: number[]
  delivery_time?: string
  format?: string
  embed_profile?: string
  bit_depth?: string
  color_mode?: string
  keep_layer_mask?: boolean
  preserve_file_integrity?: boolean
  delivery_dimension?: { width: string; height: string } | null
  delivery_resolution?: string
  preserve_original_layer?: boolean
  temp_media?: TempMedia[]
}

export interface QuoteListItem {
  id: number
  number: string
  status: QuoteStatus
  action: QuoteAction | null
  date_from: string | null
}

export interface Quote {
  id: number
  name: string
  status: {
    options: QuoteStatus[]
    value: QuoteStatus
  }
  action: {
    options: QuoteAction[]
    value: QuoteAction | null
  }
  price_per_photo: number
  extra_cost: number
  surcharge_percentage: number
  created_at: string
  updated_at: string
}

export interface ProtocolMedia {
  id: number
  collection_name: string
  name: string
  file_name: string | null
  mime_type: string
  original_url: string
  size: number
  order_column: number | null
}

export interface ProtocolProductItem {
  id: number
  product_id: number
  protocol_id: number
  product: {
    id: number
    name: string
  }
}

export interface ProtocolDetail {
  id: number
  name: string | null
  active: boolean
  delivery_time: string | null
  format: string | null
  embed_profile: string | null
  bit_depth: string | null
  color_mode: string | null
  preserve_mask: boolean
  preserve_layers: boolean
  keep_layer_mask: boolean
  preserve_file_integrity: boolean
  preserve_original_layer: boolean
  dimension: { width: string; height: string } | null
  resolution: number | null
  images_count?: number
  media?: ProtocolMedia[]
}

export interface QuoteDetailProduct {
  id: number
  name: string
  product: {
    id: number
    name: string
  }
}

export interface QuoteDetail {
  id: number
  number: string
  status: QuoteStatus
  action: QuoteAction | null
  date_from: string | null
  comment: string | null
  protocol: ProtocolDetail
  products: QuoteDetailProduct[]
  media: ProtocolMedia[]
}

export interface QuotesListResponse {
  quotes: QuoteListItem[]
  count: number
  page: number
}
