import { useCallback, useState } from 'react'
import DialogModal from '@/app/shared/ui/DialogModal'
import UploadFile from '@/app/shared/ui/UploadFile'
import type { MediaItem } from '@/app/shared/types/media'
import type { MediaCollection, TempMedia } from '@/app/shared/types/protocol'
import { uploadTempMediaApi } from '@/app/shared/api/uploadApi'

interface CollectionConfig {
  collection: MediaCollection
  title: string
  readOnly?: boolean
}

export interface TempMediaEntry {
  temp_id: string
  file_name: string
  collection: MediaCollection
}

interface UploadFilesModalProps {
  open: boolean
  onClose: () => void
  onSave: (tempMedia: TempMediaEntry[]) => Promise<void> | void
  collections: CollectionConfig[]
  existingFiles?: Partial<Record<MediaCollection, MediaItem[]>>
  onRemoveExisting?: (collection: MediaCollection, index: number) => void
}

export function UploadFilesModal({
  open,
  onClose,
  onSave,
  collections,
  existingFiles = {},
  onRemoveExisting,
}: UploadFilesModalProps) {
  const [filesByCollection, setFilesByCollection] = useState<
    Partial<Record<MediaCollection, File[]>>
  >({})
  const [tempMedia, setTempMedia] = useState<TempMediaEntry[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFilesAdded = useCallback(
    async (collection: MediaCollection, fileList: FileList | null) => {
      if (!fileList) return
      const newFiles = Array.from(fileList)
      setFilesByCollection((prev) => ({
        ...prev,
        [collection]: [...(prev[collection] ?? []), ...newFiles],
      }))

      setUploading(true)
      for (const file of newFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('collection', collection)
        const result: TempMedia = await uploadTempMediaApi(formData).send()
        setTempMedia((prev) => [
          ...prev,
          { temp_id: result.temp_id, file_name: result.file_name, collection },
        ])
      }
      setUploading(false)
    },
    [],
  )

  const handleRemove = useCallback((collection: MediaCollection, index: number) => {
    setFilesByCollection((prev) => ({
      ...prev,
      [collection]: (prev[collection] ?? []).filter((_, i) => i !== index),
    }))
    setTempMedia((prev) => {
      let count = 0
      return prev.filter((entry) => {
        if (entry.collection !== collection) return true
        return count++ !== index
      })
    })
  }, [])

  const handleEditSave = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('collection', 'example')
    const result: TempMedia = await uploadTempMediaApi(formData).send()
    setTempMedia((prev) => [
      ...prev,
      { temp_id: result.temp_id, file_name: result.file_name, collection: 'example' },
    ])
    setFilesByCollection((prev) => ({
      ...prev,
      example: [...(prev.example ?? []), file],
    }))
  }, [])

  const handleClose = useCallback(async () => {
    if (tempMedia.length > 0) {
      await onSave(tempMedia)
    }
    setFilesByCollection({})
    setTempMedia([])
    onClose()
  }, [tempMedia, onSave, onClose])

  return (
    <DialogModal
      open={open}
      onClose={handleClose}
      title="Subir archivos"
      showCloseButton={true}
      size="fullScreen"
    >
      <div className="flex flex-1 gap-4 overflow-hidden">
        {collections.map(({ collection, title, readOnly }) => (
          <div key={collection} className="flex min-w-0 flex-1 flex-col gap-2">
            <h3 className="text-sm font-semibold text-neutral-600">{title}</h3>
            <div className="flex-1 overflow-y-auto">
              <UploadFile
                title={title}
                files={filesByCollection[collection] ?? []}
                existingMedia={existingFiles[collection]}
                readOnly={readOnly}
                onFilesAdded={(files) => handleFilesAdded(collection, files)}
                onRemove={(i) => handleRemove(collection, i)}
                onRemoveExisting={
                  onRemoveExisting ? (i) => onRemoveExisting(collection, i) : undefined
                }
                onEditSave={collection !== 'example' ? handleEditSave : undefined}
              />
            </div>
          </div>
        ))}
      </div>
      {uploading && (
        <div className="text-footer text-neutral-400">Subiendo archivos...</div>
      )}
    </DialogModal>
  )
}
