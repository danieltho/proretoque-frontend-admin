import SharedProductGrid from '@/shared/ui/ProductGrid'
import { useOrderEdit } from '../context/OrderEditContext'

export default function EditProductGrid() {
  const { activeCategoryId, activeBatch, handleItemSelect } = useOrderEdit()

  if (!activeCategoryId || !activeBatch) return null

  return (
    <SharedProductGrid
      categoryId={activeCategoryId}
      selectedProducts={activeBatch.products}
      onItemSelect={handleItemSelect}
    />
  )
}
