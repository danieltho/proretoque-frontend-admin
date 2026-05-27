import type { Batch, EditableBatch } from '../../types/order'

/**
 * Pure function that converts an array of Batch (API shape) into
 * an array of EditableBatch (local editing shape).
 *
 * Maps:
 * - id → id
 * - name → name
 * - status → status
 * - size → files_size
 * - count → files_count
 * - Initializes media, newFiles, newPreviews as empty arrays
 */
export function hydrateEditableBatches(batches: Batch[]): EditableBatch[] {
  return batches.map((batch) => ({
    id: batch.id,
    name: batch.name,
    status: batch.status,
    files_size: batch.size,
    files_count: batch.count,
    media: [],
    products: (batch.products ?? []).reduce<Record<number, number[]>>((acc, item) => {
      // batch.products may arrive as display info (BatchProductInfo) instead of
      // selection data (BatchProductItem); only the latter carries the ids we need.
      if (!('product_id' in item)) return acc
      return { ...acc, [item.product_id]: [...(acc[item.product_id] ?? []), item.item_id] }
    }, {}),
    newFiles: [],
    newPreviews: [],
  }))
}
