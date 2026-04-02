import { useCallback, useEffect, useMemo, useState } from 'react'
import DropZone from '@/app/shared/ui/DropZone'
import FileListView from '@/app/shared/ui/FileListView'
import { fileToMediaItem } from '@/app/shared/utils/media'
import ImageEditorDialog from '@/app/shared/ui/ImageEditorDialog'
import type { MediaItem } from '@/app/shared/types/media'
import { useTranslation } from 'react-i18next'

interface UploadFileProps {
  title: string
  files: File[]
  existingMedia?: MediaItem[]
  readOnly?: boolean
  onFilesAdded?: (files: FileList | null) => void
  onRemove?: (index: number) => void
  onRemoveExisting?: (index: number) => void
  onEditSave?: (editedFile: File) => void
}

export default function UploadFile({
  files,
  existingMedia = [],
  readOnly = false,
  onFilesAdded,
  onRemove,
  onRemoveExisting,
  onEditSave,
}: UploadFileProps) {
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingFile, setEditingFile] = useState<File | null>(null)
  const [editorPreview, setEditorPreview] = useState<string | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handleEdit = useCallback(
    (index: number) => {
      const file = files[index]
      const stableUrl = URL.createObjectURL(file)
      setEditorPreview(stableUrl)
      setEditingFile(file)
      setEditorOpen(true)
    },
    [files],
  )

  const handleEditorSave = useCallback(
    (editedFile: File) => {
      setEditorPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      onEditSave?.(editedFile)
      setEditorOpen(false)
      setEditingFile(null)
    },
    [onEditSave],
  )

  const handleEditorClose = useCallback(() => {
    setEditorPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setEditorOpen(false)
    setEditingFile(null)
  }, [])

  return (
    <>
      {!readOnly && onFilesAdded && (
        <DropZone onFilesAdded={onFilesAdded} hasFiles={files.length > 0} />
      )}

      {existingMedia.length > 0 && (
        <FileListView items={existingMedia} onRemove={onRemoveExisting} />
      )}

      {files.length > 0 ? (
        <FileListView
          items={files.map((file, i) => fileToMediaItem(file, previews[i]))}
          onRemove={onRemove}
          onEdit={onEditSave ? handleEdit : undefined}
        />
      ) : existingMedia.length === 0 && !onFilesAdded ? (
        <p className="text-muted-foreground text-center text-sm">{t('tables.empty')}</p>
      ) : null}

      {editingFile && editorPreview && (
        <ImageEditorDialog
          open={editorOpen}
          file={editingFile}
          preview={editorPreview}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
        />
      )}
    </>
  )
}
