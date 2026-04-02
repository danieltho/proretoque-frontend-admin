import { DeliveryTime, DELIVERY_TIMES } from '@/shared/types/delivery'

export { DeliveryTime, DELIVERY_TIMES }

export interface DeliveryOptions {
  deliveryTime: DeliveryTime
  format: string
  embedProfile: string
  bitDepth: string
  colorMode: string
  preserveMask: boolean
  preserveLayers: boolean
  preserveOriginalLayer: boolean
  dimension: { width: string; height: string } | null
  resolution: string
}

export const DEFAULT_DELIVERY_OPTIONS: DeliveryOptions = {
  deliveryTime: DeliveryTime.HOUR72,
  format: 'PSD',
  embedProfile: 'No cambiar',
  bitDepth: '8bits',
  colorMode: 'rgb',
  preserveMask: false,
  preserveLayers: false,
  preserveOriginalLayer: false,
  dimension: null,
  resolution: '',
}

export interface LocalBatch {
  id: string
  name: string
  files: File[]
  previews: string[]
  products: Record<number, number[]> // productId → itemIds
  deliveryOptions: DeliveryOptions
}

export type ViewMode = 'grid' | 'list'

export const STEPS = [
  { num: 1, label: 'Lotes' },
  { num: 2, label: 'Retoques' },
  { num: 3, label: 'Resumen' },
  { num: 4, label: 'Confirmar' },
] as const

export function createBatch(index: number): LocalBatch {
  return {
    id: crypto.randomUUID(),
    name: `Lote ${index}`,
    files: [],
    previews: [],
    products: {},
    deliveryOptions: { ...DEFAULT_DELIVERY_OPTIONS },
  }
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
