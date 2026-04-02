import { useRequest } from 'alova/client'
import { getCategoryProductsApi } from '@/shared/api/productApi'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Checkbox } from '@/app/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { formatPrice } from '@/customers/orders/types/batch'
import type { Product } from '@/shared/types/category'

interface ProductGridProps {
  categoryId: number
  selectedProducts: Record<number, number[]> // productId → itemIds
  onItemSelect: (productId: number, itemIds: number[]) => void
  showPrices?: boolean
}

interface GetCategoryProductsResponse {
  products: Product[]
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
  const products: Product[] = (data as GetCategoryProductsResponse).products ?? []

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
        const items = product.items ?? []

        return (
          <div key={product.id} className="space-y-1.5">
            <p className="truncate text-center text-xs font-semibold tracking-wide uppercase">
              {product.name}
            </p>

            {product.type === 'checkbox' ? (
              <div
                className={`rounded-md border p-2 text-xs ${hasValue ? 'border-primary/30 bg-primary/10' : ''}`}
              >
                {items.map((item) => {
                  const checked = selectedIds.includes(item.id)
                  return (
                    <label key={item.id} className="flex cursor-pointer items-center gap-2 py-1">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          const updated = value
                            ? [...selectedIds, item.id]
                            : selectedIds.filter((id) => id !== item.id)
                          onItemSelect(product.id, updated)
                        }}
                      />
                      <span className="flex-1 truncate">{item.name}</span>
                      {showPrices && (
                        <span className="text-muted-foreground shrink-0">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            ) : (
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
            )}
          </div>
        )
      })}
    </div>
  )
}
