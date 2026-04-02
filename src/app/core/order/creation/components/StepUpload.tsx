import { SquaresFourIcon, ListIcon } from '@phosphor-icons/react'
import { Button } from '@/app/components/ui/button'
import { useOrderForm } from '../context/OrderFormContext'
import { formatSize } from '../../types/batch'
import DropZone from './DropZone'
import FileGridView from './FileGridView'
import FileListView from './FileListView'

export default function StepUpload() {
  const { activeBatch, viewMode, setViewMode } = useOrderForm()

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {activeBatch && (
        <>
          <DropZone />

          {activeBatch.files.length > 0 && (
            <>
              <div className="flex shrink-0 items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  {activeBatch.files.length}{' '}
                  {activeBatch.files.length === 1 ? 'imagen' : 'imágenes'} &middot;{' '}
                  {formatSize(activeBatch.files.reduce((acc, f) => acc + f.size, 0))}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <SquaresFourIcon size={32} weight="thin" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <ListIcon size={32} weight="thin" />
                  </Button>
                </div>
              </div>

              {viewMode === 'grid' ? <FileGridView /> : <FileListView />}
            </>
          )}
        </>
      )}
    </div>
  )
}
