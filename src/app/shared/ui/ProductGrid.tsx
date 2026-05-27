import { useRequest } from 'alova/client'
import { getCategoryProductsApi } from '@/app/shared/api/productApi'
import { Skeleton } from '@/app/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { formatPrice } from '@/app/core/order/types/batch'
import type { ProductOptions } from '@/app/shared/types/category'

interface ProductGridProps {
  categoryId: number
  selectedProducts: Record<number, number[]> // productId → itemIds
  onItemSelect: (productId: number, itemIds: number[]) => void
  showPrices?: boolean
}

export default function ProductGrid({
  categoryId,
  selectedProducts,
  onItemSelect,
  showPrices = true,
}: ProductGridProps) {
  const { data, loading } = useRequest(() => getCategoryProductsApi(categoryId), {
    initialData: { products: [] },
  })
  const products: ProductOptions[] = data.products ?? []

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
        No hay productos en esta categoría.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3">
      {products.map((product) => {
        const selectedIds = selectedProducts[product.id] ?? []
        const hasValue = selectedIds.length > 0
        const items = product.options ?? []

        return (
          <div key={product.id} className="space-y-1.5">
            <p className="truncate text-center text-xs font-semibold tracking-wide uppercase">
              {product.label}
            </p>

            <Select
              value={selectedIds[0] ? String(selectedIds[0]) : undefined}
              onValueChange={(val) => onItemSelect(product.id, val ? [Number(val)] : [])}
            >
              <SelectTrigger
                className={`h-8 w-full text-xs ${hasValue ? 'border-primary/30 bg-primary/10 font-medium text-primary' : ''}`}
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {showPrices ? `${item.name} — ${formatPrice(item.price)}` : item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })}
    </div>
  )
}
