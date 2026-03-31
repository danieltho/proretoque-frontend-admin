export interface Order {
  id: number
  number: number
  name: string
  status: string
  active: number
  created: string
  size: number
  count: number
  deadline: string | null
  batches: Batch[]
}

export interface BatchProductItem {
  product_id: number
  item_id: number
}

export interface BatchProductInfo {
  product_name: string
  item_name: string
  price: number
}

export interface Batch {
  id: number
  name: string
  status: string
  size: number
  count: number
  products?: BatchProductItem[] | BatchProductInfo[]
}

export interface Media {
  id: number
  file_name: string
  size: number
  url: string
}

export interface BatchDetail {
  id: number
  name: string
  status: string
  files_size: number
  files_count: number
  media: Media[]
}

export interface ListOrderData {
  orders: Order[]
}

export interface BatchProgress {
  status: string
  progress: number
  total_jobs: number
  pending_jobs: number
  failed_jobs: number
  finished: boolean
  files_count: number
  files_size: number
}

export interface MoveMediaResponse {
  source_batch: BatchDetail
  target_batch: BatchDetail
}

// Tipos para edición de pedidos
export interface EditableBatch {
  id: number
  name: string
  status: string
  files_size: number
  files_count: number
  media: Media[]
  products: Record<number, number[]> // productId → itemIds
  newFiles: File[]
  newPreviews: string[]
}

export interface PendingMove {
  mediaId: number
  fromBatchId: number
  toBatchId: number
}

export interface PendingDelete {
  mediaId: number
  batchId: number
}
