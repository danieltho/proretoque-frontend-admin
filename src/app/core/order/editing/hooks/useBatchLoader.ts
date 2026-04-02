import { useEffect } from 'react'
import { getBatchApi } from '../../api/batchesApi'
import type { EditableBatch } from '../../types/order'

interface UseBatchLoaderParams {
  activeBatchId: number | null
  setBatches: (batches: EditableBatch[] | ((prev: EditableBatch[]) => EditableBatch[])) => void
}

/**
 * Hook that loads batch details (media) when activeBatchId changes.
 * Updates the batches array with the loaded media data.
 */
export function useBatchLoader({ activeBatchId, setBatches }: UseBatchLoaderParams) {
  useEffect(() => {
    if (activeBatchId === null) {
      return
    }

    const loadBatchMedia = async () => {
      try {
        const response = await getBatchApi(activeBatchId).send()
        setBatches((prev) =>
          prev.map((b) =>
            b.id === activeBatchId
              ? {
                  ...b,
                  media: response.batch.media,
                  files_count: response.batch.files_count,
                  files_size: response.batch.files_size,
                }
              : b,
          ),
        )
      } catch (err) {
        console.error('Error loading batch media:', err)
      }
    }

    loadBatchMedia()
  }, [activeBatchId, setBatches])
}
