import { useState, useMemo, useEffect } from 'react'
import { hydrateEditableBatches } from '../utils/hydrateEditableBatches'
import { validateFiles } from '../../utils/validateFiles'
import type { Order, EditableBatch } from '../../types/order'

interface UseEditBatchManagerReturn {
  batches: EditableBatch[]
  activeBatchId: number | null
  setActiveBatchId: (id: number) => void
  activeBatch: EditableBatch | undefined
  addNewFiles: (files: FileList | File[]) => void
  removeNewFile: (index: number) => void
  validationErrors: string[]
}

/**
 * Hook that manages the state of editable batches from a loaded order.
 * Hydrates batches, manages active batch selection, and handles file operations
 * with validation.
 */
export function useEditBatchManager(order: Order | null): UseEditBatchManagerReturn {
  const [batches, setBatches] = useState<EditableBatch[]>([])
  const [activeBatchId, setActiveBatchId] = useState<number | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Hydrate batches when order changes
  useEffect(() => {
    if (order) {
      const hydrated = hydrateEditableBatches(order.batches)
      setBatches(hydrated)

      // Only set activeBatchId on first load (when not already set)
      if (activeBatchId === null && hydrated.length > 0) {
        setActiveBatchId(hydrated[0].id)
      }
    } else {
      setBatches([])
      setActiveBatchId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order])

  // Compute the active batch
  const activeBatch = useMemo(() => {
    return batches.find((b) => b.id === activeBatchId)
  }, [batches, activeBatchId])

  const addNewFiles = (files: FileList | File[]) => {
    if (!activeBatch) return

    const fileArray = Array.from(files)
    const validation = validateFiles(fileArray)

    if (validation.errors.length > 0) {
      setValidationErrors(validation.errors)
    } else {
      setValidationErrors([])
    }

    // Only add valid files
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === activeBatchId) {
          const newPreviews = validation.valid.map((file) => URL.createObjectURL(file))
          return {
            ...batch,
            newFiles: [...batch.newFiles, ...validation.valid],
            newPreviews: [...batch.newPreviews, ...newPreviews],
          }
        }
        return batch
      }),
    )
  }

  const removeNewFile = (index: number) => {
    if (!activeBatch) return

    const previewToRevoke = activeBatch.newPreviews[index]

    if (previewToRevoke) {
      URL.revokeObjectURL(previewToRevoke)
    }

    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === activeBatchId) {
          return {
            ...batch,
            newFiles: batch.newFiles.filter((_, i) => i !== index),
            newPreviews: batch.newPreviews.filter((_, i) => i !== index),
          }
        }
        return batch
      }),
    )
  }

  return {
    batches,
    activeBatchId,
    setActiveBatchId,
    activeBatch,
    addNewFiles,
    removeNewFile,
    validationErrors,
  }
}
