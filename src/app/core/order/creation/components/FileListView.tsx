import SharedFileListView from '@/shared/ui/FileListView'
import { fileToMediaItem } from '@/shared/utils/media'
import { useOrderForm } from '../context/OrderFormContext'

export default function FileListView() {
  const { activeBatch, removeFile } = useOrderForm()

  if (!activeBatch) return null

  const items = activeBatch.files.map((file, i) => fileToMediaItem(file, activeBatch.previews[i]))

  return <SharedFileListView items={items} batchName={activeBatch.name} onRemove={removeFile} />
}
