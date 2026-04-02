import { useState, useCallback } from 'react'
import type { LocalBatch, DeliveryOptions } from '../../types/batch'
import { createBatch } from '../../types/batch'
import { validateFiles } from '../../utils/validateFiles'
import type { ProtocolProductItem } from '@/shared/types/protocol'

export function useBatchManager() {
  const [batches, setBatches] = useState<LocalBatch[]>([createBatch(1)])
  const [activeBatchId, setActiveBatchId] = useState(batches[0].id)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const activeBatch = batches.find((b) => b.id === activeBatchId)
  const batchCount = batches.length
  const totalFiles = batches.reduce((acc, b) => acc + b.files.length, 0)

  const addBatch = () => {
    const newBatch = createBatch(batchCount + 1)
    setBatches((prev) => [...prev, newBatch])
    setActiveBatchId(newBatch.id)
  }

  const removeBatch = (id: string) => {
    // Guard: cannot remove the last batch
    if (batchCount <= 1) return

    setBatches((prev) => {
      // Find the batch being removed to clean up its ObjectURLs
      const batchToRemove = prev.find((b) => b.id === id)
      if (batchToRemove) {
        // Revoke all object URLs to free memory
        batchToRemove.previews.forEach((url) => {
          if (url) URL.revokeObjectURL(url)
        })
      }

      const next = prev.filter((b) => b.id !== id)
      // If the removed batch was active, switch to the first remaining batch
      if (activeBatchId === id) setActiveBatchId(next[0]?.id || '')
      return next
    })
  }

  const renameBatch = (id: string, name: string) => {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, name } : b)))
  }

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      // Guard: no files or no active batch
      if (!newFiles || !activeBatch) return

      const allFiles = Array.from(newFiles)

      // Validate type and size before adding to batch
      const { valid: imageFiles, errors } = validateFiles(allFiles)

      // Always update validation errors (even if empty, to clear previous ones)
      setValidationErrors(errors)

      // Guard: no valid files after validation
      if (imageFiles.length === 0) return

      // Create object URLs for previews
      const newPreviews = imageFiles.map((f) => URL.createObjectURL(f))

      // Update batches with valid files only
      setBatches((prev) =>
        prev.map((b) =>
          b.id === activeBatchId
            ? {
                ...b,
                files: [...b.files, ...imageFiles],
                previews: [...b.previews, ...newPreviews],
              }
            : b,
        ),
      )
    },
    [activeBatch, activeBatchId],
  )

  const removeFile = (index: number) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== activeBatchId) return b

        // Guard: invalid index
        if (index < 0 || index >= b.previews.length) return b

        // Revoke the object URL to free memory
        const objectUrl = b.previews[index]
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
        }

        return {
          ...b,
          files: b.files.filter((_, i) => i !== index),
          previews: b.previews.filter((_, i) => i !== index),
        }
      }),
    )
  }

  const handleItemSelect = (productId: number, itemIds: number[]) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== activeBatchId) return b
        const next = { ...b.products }
        if (itemIds.length === 0) {
          delete next[productId]
        } else {
          next[productId] = itemIds
        }
        return { ...b, products: next }
      }),
    )
  }

  const clearBatchProducts = () => {
    setBatches((prev) => prev.map((b) => (b.id === activeBatchId ? { ...b, products: {} } : b)))
  }

  const initProductsFromProtocol = (productItems: ProtocolProductItem[]) => {
    const products = productItems.reduce<Record<number, number[]>>((acc, item) => {
      const productId = item.product.id
      return { ...acc, [productId]: [...(acc[productId] ?? []), item.id] }
    }, {})
    setBatches((prev) => prev.map((b) => (b.id === activeBatchId ? { ...b, products } : b)))
  }

  const updateDeliveryOptions = (batchId: string, options: Partial<DeliveryOptions>) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId ? { ...b, deliveryOptions: { ...b.deliveryOptions, ...options } } : b,
      ),
    )
  }

  const applyDeliveryToAll = (options: DeliveryOptions) => {
    setBatches((prev) => prev.map((b) => ({ ...b, deliveryOptions: { ...options } })))
  }

  return {
    batches,
    activeBatchId,
    setActiveBatchId,
    activeBatch,
    batchCount,
    totalFiles,
    validationErrors,
    addBatch,
    removeBatch,
    renameBatch,
    handleFiles,
    removeFile,
    handleItemSelect,
    clearBatchProducts,
    initProductsFromProtocol,
    updateDeliveryOptions,
    applyDeliveryToAll,
  }
}
