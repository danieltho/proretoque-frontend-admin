import SharedProductGrid from '@/shared/ui/ProductGrid'
import { useOrderForm } from '../context/OrderFormContext'

export default function ProductGrid() {
  const { activeCategoryId, activeBatch, handleItemSelect } = useOrderForm()

  if (!activeCategoryId || !activeBatch) return null

  return (
    <SharedProductGrid
      categoryId={activeCategoryId}
      selectedProducts={activeBatch.products}
      onItemSelect={handleItemSelect}
    />
  )
}
