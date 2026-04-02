import { SquaresFour, Rows } from '@phosphor-icons/react'
import { Button } from '@/app/components/ui/button'
import { useOrderEdit } from '../context/OrderEditContext'
import EditBatchTabs from './EditBatchTabs'
import MediaListView from './MediaListView'
import MediaGridView from './MediaGridView'

export default function EditStepBatches() {
  const { activeBatch, viewMode, setViewMode } = useOrderEdit()

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <EditBatchTabs />

      {activeBatch && (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {activeBatch.media.length} {activeBatch.media.length === 1 ? 'imagen' : 'imágenes'} en
              este lote
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

          {/* Content */}
          {viewMode === 'grid' ? <MediaGridView /> : <MediaListView />}
        </div>
      )}
    </div>
  )
}
