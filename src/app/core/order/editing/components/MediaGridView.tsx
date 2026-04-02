import { useState } from 'react'
import { Trash, ArrowsLeftRight, CircleNotch } from '@phosphor-icons/react'
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
import type { Media } from '../../types/order'

export default function MediaGridView() {
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
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {activeBatch.media.map((media) => (
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

            {/* Overlay con acciones */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-colors group-hover:bg-black/40 group-hover:opacity-100">
              {/* Move */}
              {otherBatches.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="rounded-full bg-white/90 p-2 text-black transition-colors hover:bg-white"
                      disabled={movingId === media.id}
                    >
                      {movingId === media.id ? (
                        <CircleNotch className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowsLeftRight className="h-4 w-4" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
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
              <button
                onClick={() => setDeletingMedia(media)}
                className="text-destructive rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>

            {/* Filename */}
            <div className="absolute right-0 bottom-0 left-0 truncate bg-black/60 px-1 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              {media.file_name}
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
