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

  // Combine existing + new into a single list
  const newMediaItems = useMemo(
    () => files.map((file, i) => fileToMediaItem(file, previews[i])),
    [files, previews],
  )
  const allItems = useMemo(
    () => [...existingMedia, ...newMediaItems],
    [existingMedia, newMediaItems],
  )

  const handleRemove = useCallback(
    (index: number) => {
      if (index < existingMedia.length) {
        onRemoveExisting?.(index)
      } else {
        onRemove?.(index - existingMedia.length)
      }
    },
    [existingMedia.length, onRemove, onRemoveExisting],
  )

  const handleEdit = useCallback(
    (index: number) => {
      // Only new files can be edited (not existing media)
      const newIndex = index - existingMedia.length
      if (newIndex < 0) return
      const file = files[newIndex]
      const stableUrl = URL.createObjectURL(file)
      setEditorPreview(stableUrl)
      setEditingFile(file)
      setEditorOpen(true)
    },
    [files, existingMedia.length],
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
        <DropZone onFilesAdded={onFilesAdded} hasFiles={allItems.length > 0} />
      )}

      {allItems.length > 0 ? (
        <FileListView
          items={allItems}
          onRemove={onRemove || onRemoveExisting ? handleRemove : undefined}
          onEdit={onEditSave ? handleEdit : undefined}
        />
      ) : !onFilesAdded ? (
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
