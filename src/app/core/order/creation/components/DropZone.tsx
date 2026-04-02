import { useOrderForm } from '../context/OrderFormContext'
import SharedDropZone from '@/shared/ui/DropZone'

export default function DropZone() {
  const { activeBatch, handleFiles } = useOrderForm()

  if (!activeBatch) return null

  return <SharedDropZone onFilesAdded={handleFiles} hasFiles={activeBatch.files.length > 0} />
}
