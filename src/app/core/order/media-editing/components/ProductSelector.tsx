import { useRequest } from 'alova/client'
import { getCategoryProductsApi } from '@/shared/api/productApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { Skeleton } from '@/app/components/ui/skeleton'
import type { Product } from '@/shared/types/category'

interface Props {
  categoryId: number
  categoryName: string
  selectedItems: Record<number, number>
  onItemSelect: (productId: number, itemId: number | null) => void
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default function ProductSelector({
  categoryId,
  categoryName,
  selectedItems,
  onItemSelect,
}: Props) {
  const { data, loading } = useRequest(() => getCategoryProductsApi(categoryId), {
    initialData: { products: [] },
  })

  const products: Product[] = data.products

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{categoryName}</h3>
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{categoryName}</h3>
        <p className="text-muted-foreground text-sm">No hay productos en esta categoría.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{categoryName}</h3>
      {products.map((product) => {
        const selectedItemId = selectedItems[product.id]
        const selectedItem = product.items.find((it) => it.id === selectedItemId)

        return (
          <Card key={product.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{product.name}</CardTitle>
              <p className="text-muted-foreground text-sm">{product.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nivel de complejidad</label>
                <Select
                  value={selectedItemId ? String(selectedItemId) : undefined}
                  onValueChange={(val) => onItemSelect(product.id, val ? Number(val) : null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {product.items.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name} — {formatPrice(item.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedItem && (
                <div className="bg-muted/50 flex items-start justify-between gap-4 rounded-md p-3">
                  <p className="text-muted-foreground text-sm">
                    {selectedItem.descriptions.client}
                  </p>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatPrice(selectedItem.price)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
