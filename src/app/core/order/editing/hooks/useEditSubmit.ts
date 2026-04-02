import { useState, useCallback } from 'react'
import { updateOrderApi } from '../../api/ordersApi'
import { uploadBatchImagesApi, setBatchProductsApi } from '../../api/batchesApi'
import { useUploadStore } from '@/app/stores/uploadStore'
import { sanitizeFileName } from '../../utils/validateFiles'
import type { Order, EditableBatch } from '../../types/order'

interface UseEditSubmitParams {
  order: Order | null
  orderName: string
  originalName: string
  batches: EditableBatch[]
  onSuccess: () => void
}

interface UseEditSubmitReturn {
  submitting: boolean
  handleSubmit: () => Promise<void>
}

/**
 * Hook that orchestrates saving all order changes:
 * 1. Updates order name if changed
 * 2. Uploads new files for each batch that has them
 * 3. Updates batch products if changed
 * Exposes submitting state and handleSubmit function.
 */
export function useEditSubmit({
  order,
  orderName,
  originalName,
  batches,
  onSuccess,
}: UseEditSubmitParams): UseEditSubmitReturn {
  const [submitting, setSubmitting] = useState(false)
  const { addTask, updateTask } = useUploadStore()

  const handleSubmit = useCallback(async () => {
    if (!order) {
      return
    }

    setSubmitting(true)

    try {
      // Step 1: Update order name if changed
      if (orderName !== originalName) {
        const trimmedName = orderName.trim()
        if (trimmedName.length === 0 || trimmedName.length > 255) {
          throw new Error('El nombre de la pedido debe tener entre 1 y 255 caracteres')
        }
        await updateOrderApi(order.id, { name: trimmedName }).send()
      }

      // Step 2: Upload new files for each batch
      for (const batch of batches) {
        if (batch.newFiles.length > 0) {
          const taskId = `upload-batch-${batch.id}-${Date.now()}`

          // Add task to upload store
          addTask({
            id: taskId,
            batchId: batch.id,
            name: `Subiendo ${batch.name}`,
            progress: 0,
            status: 'uploading',
          })

          try {
            // Create FormData and append files with sanitized names
            const formData = new FormData()
            batch.newFiles.forEach((file) => {
              const safeName = sanitizeFileName(file.name)
              formData.append('files', file, safeName)
            })

            await uploadBatchImagesApi(batch.id, formData).send()

            // Mark as completed
            updateTask(taskId, {
              status: 'completed',
              progress: 100,
            })
          } catch (error) {
            // Mark as error
            updateTask(taskId, {
              status: 'error',
              error: error instanceof Error ? error.message : 'Error desconocido',
            })
            // Continue with other batches even if one fails
          }
        }
      }

      // Step 3: Update products for each batch
      for (const batch of batches) {
        const itemIds = Object.values(batch.products).flat()
        if (itemIds.length > 0) {
          await setBatchProductsApi(batch.id, { products: itemIds }).send()
        }
      }

      // Step 4: Call onSuccess callback
      onSuccess()
    } finally {
      setSubmitting(false)
    }
  }, [order, orderName, originalName, batches, addTask, updateTask, onSuccess])

  return {
    submitting,
    handleSubmit,
  }
}
