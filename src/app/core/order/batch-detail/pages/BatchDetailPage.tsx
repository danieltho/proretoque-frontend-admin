import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRequest } from 'alova/client'
import { getBatchApi } from '../../api/batchesApi'
import { useUploadStore } from '@/app/stores/uploadStore'
import { uploadWithProgress } from '../../utils/uploadWithProgress'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Card, CardContent } from '@/app/components/ui/card'
import { Skeleton } from '@/app/components/ui/skeleton'
import {
  ArrowLeft,
  CheckCircle,
  CircleNotch,
  Clock,
  Pencil,
  Trash,
  Upload,
  SquaresFour,
  Rows,
} from '@phosphor-icons/react'
import type { Media } from '../../types/order'
import ImageEditorDialog from '../../media-editing/components/ImageEditorDialog'
import DeleteMediaDialog from '../../media-editing/components/DeleteMediaDialog'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function statusLabel(status: string) {
  switch (status) {
    case 'completed':
      return 'Completado'
    case 'processing':
      return 'Procesando'
    default:
      return 'Creado'
  }
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default'
    case 'processing':
      return 'outline'
    default:
      return 'secondary'
  }
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'processing':
      return <CircleNotch className="h-4 w-4 animate-spin text-blue-500" />
    default:
      return <Clock className="text-muted-foreground h-4 w-4" />
  }
}

type ViewMode = 'grid' | 'list'

export default function BatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data, loading, error, send: refetch } = useRequest(() => getBatchApi(Number(batchId!)))
  const batch = data?.batch

  const [editMedia, setEditMedia] = useState<Media | null>(null)
  const [deleteMedia, setDeleteMedia] = useState<Media | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [uploading, setUploading] = useState(false)

  const { addTask, updateTask } = useUploadStore()

  const handleUploadFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !batchId) return
    const imageFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    setUploading(true)
    const taskId = crypto.randomUUID()
    const formData = new FormData()
    imageFiles.forEach((file) => formData.append('images[]', file))

    addTask({
      id: taskId,
      name: `${imageFiles.length} imágenes`,
      progress: 0,
      status: 'uploading',
    })

    uploadWithProgress(`/orders/batch/${batchId}/images`, formData, (percent) =>
      updateTask(taskId, { progress: percent }),
    )
      .then(() => {
        updateTask(taskId, { status: 'completed', progress: 100 })
        refetch()
      })
      .catch((err) => {
        updateTask(taskId, { status: 'error', error: err.message })
      })
      .finally(() => setUploading(false))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleUploadFiles(e.dataTransfer.files)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !batch) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <p className="text-destructive">{error?.message || 'Lote no encontrado'}</p>
      </div>
    )
  }

  const hasMedia = batch.media.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{batch.name}</h2>
          <p className="text-muted-foreground text-sm">
            {batch.files_count} imágenes &middot; {formatSize(batch.files_size)}
          </p>
        </div>
        <Badge className="ml-auto gap-1" variant={statusVariant(batch.status)}>
          <StatusIcon status={batch.status} />
          {statusLabel(batch.status)}
        </Badge>
      </div>

      {/* Zona de upload */}
      <Card
        className={`hover:border-primary/50 cursor-pointer border-2 border-dashed transition-colors ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <CardContent
          className={`flex flex-col items-center justify-center ${hasMedia ? 'py-4' : 'py-12'}`}
        >
          {uploading ? (
            <CircleNotch className="text-muted-foreground h-6 w-6 animate-spin" />
          ) : (
            <>
              <Upload
                className={`text-muted-foreground ${hasMedia ? 'mb-1 h-6 w-6' : 'mb-4 h-10 w-10'}`}
              />
              <p className={`font-medium ${hasMedia ? 'text-sm' : 'text-lg'}`}>
                {hasMedia ? 'Agregar más imágenes' : 'Arrastra imágenes aquí'}
              </p>
              {!hasMedia && (
                <p className="text-muted-foreground text-sm">
                  o haz clic para seleccionar archivos
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleUploadFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {/* Toolbar: toggle de vista */}
      {hasMedia && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {batch.media.length} {batch.media.length === 1 ? 'imagen' : 'imágenes'}
          </p>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <SquaresFour className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <Rows className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Galería mosaico */}
      {hasMedia && viewMode === 'grid' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {batch.media.map((media) => (
            <div
              key={media.id}
              className="group relative aspect-square overflow-hidden rounded-md border"
            >
              <img
                src={media.url}
                alt={media.file_name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-colors group-hover:bg-black/40 group-hover:opacity-100">
                <button
                  onClick={() => setEditMedia(media)}
                  className="rounded-full bg-white/90 p-2 text-black transition-colors hover:bg-white"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteMedia(media)}
                  className="text-destructive rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute right-0 bottom-0 left-0 truncate bg-black/60 px-1 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {media.file_name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista listado */}
      {hasMedia && viewMode === 'list' && (
        <div className="overflow-hidden rounded-md border">
          {batch.media.map((media, index) => (
            <div
              key={media.id}
              className={`hover:bg-muted/50 flex items-center gap-3 px-3 py-2 transition-colors ${index > 0 ? 'border-t' : ''}`}
            >
              <img
                src={media.url}
                alt={media.file_name}
                className="h-12 w-12 shrink-0 rounded object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{media.file_name}</p>
                <p className="text-muted-foreground text-xs">{formatSize(media.size)}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditMedia(media)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-8 w-8"
                  onClick={() => setDeleteMedia(media)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor de imagen */}
      {editMedia && (
        <ImageEditorDialog
          open={!!editMedia}
          onClose={() => setEditMedia(null)}
          media={editMedia}
          batchId={Number(batchId)}
          onSaved={refetch}
        />
      )}

      {/* Confirmar eliminación */}
      {deleteMedia && (
        <DeleteMediaDialog
          open={!!deleteMedia}
          onClose={() => setDeleteMedia(null)}
          media={deleteMedia}
          batchId={Number(batchId)}
          onDeleted={refetch}
        />
      )}
    </div>
  )
}
