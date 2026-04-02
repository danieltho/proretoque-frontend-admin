import SharedProductGrid from '@/shared/ui/ProductGrid'

interface ProductGridProps {
  categoryId: number
  selectedProducts: Record<number, number[]>
  onItemSelect: (productId: number, itemIds: number[]) => void
}

export default function ProductGrid(props: ProductGridProps) {
  return <SharedProductGrid {...props} />
}
