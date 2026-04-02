import { useState } from 'react'
import { Trash, ArrowsLeftRight, CircleNotch } from '@phosphor-icons/react'
import { Button } from '@/app/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog'
import { useOrderEdit } from '../context/OrderEditContext'
import { formatSize } from '../../types/batch'
import type { Media } from '../../types/order'

export default function MediaListView() {
  const { activeBatch, batches, activeBatchId, moveMedia, deleteMedia } = useOrderEdit()
  const [movingId, setMovingId] = useState<number | null>(null)
  const [deletingMedia, setDeletingMedia] = useState<Media | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!activeBatch) return null

  const otherBatches = batches.filter((b) => b.id !== activeBatchId)

  const handleMove = async (mediaId: number, targetBatchId: number) => {
    setMovingId(mediaId)
    try {
      await moveMedia(mediaId, targetBatchId)
    } finally {
      setMovingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deletingMedia) return
    setIsDeleting(true)
    try {
      await deleteMedia(deletingMedia.id)
      setDeletingMedia(null)
    } finally {
      setIsDeleting(false)
    }
  }

  if (activeBatch.media.length === 0) {
    return (
      <div className="text-muted-foreground rounded-md border p-8 text-center">
        Este lote no tiene imágenes
      </div>
    )
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto rounded-md border">
        {/* Header */}
        <div className="bg-muted/50 text-muted-foreground flex items-center gap-3 border-b px-3 py-2 text-xs font-semibold tracking-wide uppercase">
          <span className="w-12 shrink-0">Imagen</span>
          <span className="flex-1">Nombre</span>
          <span className="w-20 shrink-0 text-right">Tamaño</span>
          <span className="w-24 shrink-0 text-right">Acciones</span>
        </div>

        {/* Items */}
        {activeBatch.media.map((media, index) => (
          <div
            key={media.id}
            className={`hover:bg-muted/50 flex items-center gap-3 px-3 py-2 transition-colors ${index > 0 ? 'border-t' : ''}`}
          >
            <img
              src={media.url}
              alt={media.file_name}
              className="h-10 w-10 shrink-0 rounded object-cover"
              loading="lazy"
            />
            <p className="min-w-0 flex-1 truncate text-sm">{media.file_name}</p>
            <span className="text-muted-foreground w-20 shrink-0 text-right text-xs">
              {formatSize(media.size)}
            </span>
            <div className="flex w-24 shrink-0 justify-end gap-1">
              {/* Move dropdown */}
              {otherBatches.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={movingId === media.id}
                    >
                      {movingId === media.id ? (
                        <CircleNotch className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ArrowsLeftRight className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <p className="text-muted-foreground px-2 py-1.5 text-xs">Mover a:</p>
                    {otherBatches.map((batch) => (
                      <DropdownMenuItem
                        key={batch.id}
                        onClick={() => handleMove(media.id, batch.id)}
                      >
                        {batch.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive h-7 w-7"
                onClick={() => setDeletingMedia(media)}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingMedia} onOpenChange={() => setDeletingMedia(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La imagen "{deletingMedia?.file_name}" será
              eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <CircleNotch className="mr-2 h-4 w-4 animate-spin" /> Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
