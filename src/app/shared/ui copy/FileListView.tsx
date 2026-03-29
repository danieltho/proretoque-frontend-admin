import { XIcon, NotePencilIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { formatSize } from '@/customers/orders/types/batch'
import { isImageFile, getFileExtLabel, getFileIcon } from '@/shared/utils/fileType'
import type { MediaItem } from '@/shared/types/media'

interface FileListViewProps {
  items: MediaItem[]
  batchName?: string
  onRemove?: (index: number) => void
  onEdit?: (index: number) => void
}

export default function FileListView({ items, batchName, onRemove, onEdit }: FileListViewProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto rounded-md border">
      <div className="bg-muted/50 text-muted-foreground flex items-center gap-3 border-b px-3 py-2 text-xs font-semibold tracking-wide uppercase">
        <span className="w-12 shrink-0">Archivo</span>
        <span className="flex-1">Nombre</span>
        <span className="w-14 shrink-0">Tipo</span>
        {batchName && <span className="w-20 shrink-0">Lote</span>}
        <span className="w-20 shrink-0 text-right">Tamaño</span>
        {(onEdit || onRemove) && <span className="w-20 shrink-0 text-right">Opciones</span>}
      </div>
      {items.map((item, index) => {
        const isImage = isImageFile(item)
        const IconComponent = getFileIcon(item)

        return (
          <div
            key={index}
            className={`hover:bg-muted/50 flex items-center gap-3 px-3 py-2 transition-colors ${index > 0 ? 'border-t' : ''}`}
          >
            {isImage ? (
              <img
                src={item.src}
                alt={item.name}
                className="h-10 w-10 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded">
                <IconComponent className="text-muted-foreground h-5 w-5" />
              </div>
            )}
            <p className="min-w-0 flex-1 truncate text-sm">{item.name}</p>
            <span className="text-muted-foreground w-14 shrink-0 text-xs">
              {getFileExtLabel(item)}
            </span>
            {batchName && (
              <span className="text-muted-foreground w-20 shrink-0 truncate text-xs">
                {batchName}
              </span>
            )}
            <span className="text-muted-foreground w-20 shrink-0 text-right text-xs">
              {formatSize(item.size)}
            </span>
            {(onEdit || onRemove) && (
              <div className="flex w-20 shrink-0 justify-end gap-1">
                {onEdit && isImage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(index)}
                    aria-label="Editar archivo"
                  >
                    <NotePencilIcon className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-7 w-7"
                    onClick={() => onRemove(index)}
                    aria-label="Eliminar archivo"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
