export type MediaCollection = 'original' | 'example' | 'resource' | 'sample'

export interface ProtocolProductItem {
  id: number
  name: string
  product: { id: number; name: string }
}

export interface ProtocolMedia {
  id: number
  file_name: string
  url: string
  preview_url: string | null
}

export interface ProtocolMediaCollections {
  original: ProtocolMedia[]
  example: ProtocolMedia[]
  resource: ProtocolMedia[]
}

export interface Protocol {
  id: number
  name: string
  active: boolean
  delivery_time: string | null
  images_count: number
  created_at: string
  product_items: ProtocolProductItem[]
}

export interface TempMedia {
  temp_id: string
  file_name: string
  collection: MediaCollection
}
