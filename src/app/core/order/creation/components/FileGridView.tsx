import SharedFileGridView from '@/shared/ui/FileGridView'
import { fileToMediaItem } from '@/shared/utils/media'
import { useOrderForm } from '../context/OrderFormContext'

export default function FileGridView() {
  const { activeBatch, removeFile } = useOrderForm()

  if (!activeBatch) return null

  const items = activeBatch.files.map((file, i) => fileToMediaItem(file, activeBatch.previews[i]))

  return <SharedFileGridView items={items} onRemove={removeFile} />
}
