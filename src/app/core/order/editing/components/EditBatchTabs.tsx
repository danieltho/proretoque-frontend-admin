import { useOrderEdit } from '../context/OrderEditContext'
import { formatSize } from '../../types/batch'

export default function EditBatchTabs() {
  const { batches, activeBatchId, setActiveBatchId } = useOrderEdit()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {batches.map((batch, i) => (
        <button
          key={batch.id}
          type="button"
          onClick={() => setActiveBatchId(batch.id)}
          className={`flex flex-col items-start rounded-md border px-3 py-2 text-sm transition-colors ${
            activeBatchId === batch.id
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-border hover:bg-accent'
          }`}
        >
          <span className="font-medium">
            {i + 1}. {batch.name}
          </span>
          <span
            className={`text-xs ${activeBatchId === batch.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
          >
            {batch.files_count} imgs · {formatSize(batch.files_size)}
            {batch.newFiles.length > 0 && (
              <span className="ml-1 text-green-500">+{batch.newFiles.length} nuevas</span>
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
