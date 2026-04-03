import { useCallback, useState } from 'react'
import { SortableDataTable } from '@/app/components/ui/sortable-data-table'
import { useOrderAdminBatches } from '../hooks/useOrderAdminBatches'
import { Pagination } from '@/app/shared/ui/Pagination'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { PlusCircleIcon } from '@phosphor-icons/react'
import { UploadFilesModal, type TempMediaEntry } from '../modal/UploadFilesModal'
import { RetoquesModal } from '../modal/RetoquesModal'
import { DeliveryOptionsModal } from '../modal/DeliveryOptionsModal'

import {
  getBatchMediaApi,
  deleteBatchMediaApi,
  saveBatchMediaApi,
  type BatchMediaFile,
} from '../api/orderApi'
import type { MediaCollection } from '@/app/shared/types/protocol'
import type { MediaItem } from '@/app/shared/types/media'

function mapToMediaItem(file: BatchMediaFile): MediaItem {
  return {
    id: file.id,
    src: file.preview_url ?? file.url,
    name: file.file_name,
    fileName: file.file_name,
    mimeType: file.mime_type,
    size: file.size,
  }
}

export default function BatchDataTableSortable() {
  const [uploadBatchId, setUploadBatchId] = useState<number | null>(null)
  const [retouchesBatchId, setRetouchesBatchId] = useState<number | null>(null)
  const [deliveryBatchId, setDeliveryBatchId] = useState<number | null>(null)
  const [existingFiles, setExistingFiles] = useState<
    Partial<Record<MediaCollection, MediaItem[]>>
  >({})

  const loadBatchMedia = useCallback(async (batchId: number) => {
    try {
      const data = await getBatchMediaApi(batchId).send()
      const mapped: Partial<Record<MediaCollection, MediaItem[]>> = {}
      for (const key of Object.keys(data) as MediaCollection[]) {
        mapped[key] = data[key].map(mapToMediaItem)
      }
      setExistingFiles(mapped)
    } catch {
      setExistingFiles({})
    }
  }, [])

  const handleOpenUpload = useCallback(
    (batchId: number) => {
      setUploadBatchId(batchId)
      loadBatchMedia(batchId)
    },
    [loadBatchMedia],
  )

  const { batches, columns, page, setPage, totalPages, loading, handleReorder, refetch } =

    useOrderAdminBatches({
      onUploadFiles: handleOpenUpload,
      onRetouches: setRetouchesBatchId,
      onDeliveryOptions: setDeliveryBatchId,
    })
    useOrderAdminBatches({ onUploadFiles: handleOpenUpload, onRetouches: setRetouchesBatchId })

  const handleSave = useCallback(
    async (tempMedia: TempMediaEntry[]) => {
      if (!uploadBatchId || tempMedia.length === 0) return
      await saveBatchMediaApi(uploadBatchId, tempMedia).send()
      refetch()
    },
    [uploadBatchId, refetch],
  )

  const handleCloseUpload = useCallback(() => {
    setUploadBatchId(null)
    setExistingFiles({})
  }, [])

  const handleRemoveExisting = useCallback(
    async (collection: MediaCollection, index: number) => {
      if (!uploadBatchId) return
      const items = existingFiles[collection]
      const item = items?.[index]
      if (!item?.id) return
      await deleteBatchMediaApi(uploadBatchId, item.id).send()
      setExistingFiles((prev) => ({
        ...prev,
        [collection]: (prev[collection] ?? []).filter((_, i) => i !== index),
      }))
    },
    [uploadBatchId, existingFiles],
  )

  const handleAddClick = () => 1 == 1

  /**
   * cambiar esto por un skeleton
   */
  if (loading && batches.length === 0) return <div>Cargando lotes...</div>

  return (
    <>
      <header>
        <TitleSection
          title="Resumen de Lotes"
          actions={[
            {
              label: 'Agregar Lote',
              onClick: handleAddClick,
              icon: PlusCircleIcon,
              variant: 'blue',
            },
          ]}
        />
      </header>
      <SortableDataTable columns={columns} data={batches} onReorder={handleReorder} />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {uploadBatchId && (
        <UploadFilesModal
          open
          onClose={handleCloseUpload}
          onSave={handleSave}
          collections={[
            { collection: 'original', title: 'Archivos a retocar' },
            { collection: 'resource', title: 'Recursos' },
            { collection: 'example', title: 'Ejemplos', readOnly: true },
          ]}
          existingFiles={existingFiles}
          onRemoveExisting={handleRemoveExisting}
        />
      )}

      {retouchesBatchId && (
        <RetoquesModal
          open
          batchId={retouchesBatchId}
          onClose={() => setRetouchesBatchId(null)}
          onSaved={refetch}
        />
      )}

      {deliveryBatchId && (
        <DeliveryOptionsModal
          open
          batchId={deliveryBatchId}
          onClose={() => setDeliveryBatchId(null)}
          onSaved={refetch}
        />
      )}

    </>
  )
}
