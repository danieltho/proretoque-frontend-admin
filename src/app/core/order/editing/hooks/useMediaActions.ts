import { useState, useCallback } from 'react'
import { moveMediaApi, deleteMediaApi } from '../../api/batchesApi'
import type { EditableBatch } from '../../types/order'

interface UseMediaActionsParams {
  batches: EditableBatch[]
  activeBatchId: number | null
  setBatches: (batches: EditableBatch[] | ((prev: EditableBatch[]) => EditableBatch[])) => void
}

interface UseMediaActionsReturn {
  moveMedia: (mediaId: number, targetBatchId: number) => Promise<void>
  deleteMedia: (mediaId: number) => Promise<void>
  movingMediaId: number | null
  deletingMediaId: number | null
  lastError: string | null
}

/**
 * Hook that encapsulates media operations (move and delete) within batches.
 * Manages loading states and delegates batch state updates via setBatches callback.
 *
 * Note: 'batches' parameter is part of the interface for consistency but not directly
 * used in this hook since setBatches callback handles batch updates.
 */
export function useMediaActions({
  activeBatchId,
  setBatches,
}: UseMediaActionsParams): UseMediaActionsReturn {
  const [movingMediaId, setMovingMediaId] = useState<number | null>(null)
  const [deletingMediaId, setDeleteingMediaId] = useState<number | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)

  const moveMedia = useCallback(
    async (mediaId: number, targetBatchId: number) => {
      // Guard: cannot move without active batch
      if (activeBatchId === null) {
        return
      }

      // Guard: cannot move to the same batch
      if (targetBatchId === activeBatchId) {
        return
      }

      setMovingMediaId(mediaId)
      setLastError(null)

      try {
        const response = await moveMediaApi(activeBatchId, mediaId, targetBatchId).send()

        // Update batches with the response data
        setBatches((prev) =>
          prev.map((batch) => {
            if (batch.id === activeBatchId) {
              return {
                ...batch,
                media: response.source_batch.media,
                files_size: response.source_batch.files_size,
                files_count: response.source_batch.files_count,
              }
            }
            if (batch.id === targetBatchId) {
              return {
                ...batch,
                media: response.target_batch.media,
                files_size: response.target_batch.files_size,
                files_count: response.target_batch.files_count,
              }
            }
            return batch
          }),
        )
      } catch (err) {
        setLastError(err instanceof Error ? err.message : 'Error al mover imagen')
      } finally {
        setMovingMediaId(null)
      }
    },
    [activeBatchId, setBatches],
  )

  const deleteMedia = useCallback(
    async (mediaId: number) => {
      // Guard: cannot delete without active batch
      if (activeBatchId === null) {
        return
      }

      setDeleteingMediaId(mediaId)
      setLastError(null)

      try {
        await deleteMediaApi(activeBatchId, mediaId).send()

        // Remove the media from the active batch
        setBatches((prev) =>
          prev.map((batch) => {
            if (batch.id === activeBatchId) {
              const newMedia = batch.media.filter((m) => m.id !== mediaId)
              return {
                ...batch,
                media: newMedia,
                files_count: newMedia.length,
                files_size: newMedia.reduce((sum, m) => sum + m.size, 0),
              }
            }
            return batch
          }),
        )
      } catch (err) {
        setLastError(err instanceof Error ? err.message : 'Error al eliminar imagen')
      } finally {
        setDeleteingMediaId(null)
      }
    },
    [activeBatchId, setBatches],
  )

  return {
    moveMedia,
    deleteMedia,
    movingMediaId,
    deletingMediaId,
    lastError,
  }
}
