import { X } from '@phosphor-icons/react'
import { formatSize } from '@/customers/orders/types/batch'
import type { MediaItem } from '@/shared/types/media'

interface FileGridViewProps {
  items: MediaItem[]
  onRemove?: (index: number) => void
  onClick?: (index: number) => void
}

export default function FileGridView({ items, onRemove, onClick }: FileGridViewProps) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((item, i) => (
        <div
          key={i}
          className={`group relative aspect-square overflow-hidden rounded-md border ${onClick ? 'cursor-pointer' : ''}`}
          onClick={onClick ? () => onClick(i) : undefined}
        >
          <img src={item.src} alt={item.name} className="h-full w-full object-cover" />
          {onRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(i)
              }}
              className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <div className="absolute right-0 bottom-0 left-0 truncate bg-black/60 px-1 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            {formatSize(item.size)}
          </div>
        </div>
      ))}
    </div>
  )
}
