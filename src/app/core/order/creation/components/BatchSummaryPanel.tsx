import { useMemo } from 'react'
import { useRequest } from 'alova/client'
import { getCategoryProductsApi } from '@/shared/api/productApi'
import { Button } from '@/app/components/ui/button'
import { Trash } from '@phosphor-icons/react'
import { formatPrice } from '../../types/batch'
import { useOrderForm } from '../context/OrderFormContext'
import type { Product } from '@/shared/types/category'

export default function BatchSummaryPanel() {
  const { activeBatch, activeCategoryId, clearBatchProducts } = useOrderForm()
  const allSelectedProducts = useMemo(
    () =>
      activeBatch
        ? Object.entries(activeBatch.products).flatMap(([productId, itemIds]) =>
            itemIds.map((itemId) => ({
              productId: Number(productId),
              itemId,
            })),
          )
        : [],
    [activeBatch],
  )

  if (!activeBatch) return null

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-sm">
        <p>
          N° de Archivos: <span className="font-medium">{activeBatch.files.length}</span>
        </p>
        <p>
          Retoques: <span className="font-medium">{Object.keys(activeBatch.products).length}</span>
        </p>
      </div>

      {allSelectedProducts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Retoques a realizar
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive h-6 w-6"
              onClick={clearBatchProducts}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
          <ul className="space-y-1">
            {allSelectedProducts.map(({ productId, itemId }) => (
              <SelectedProductRow
                key={productId}
                categoryId={activeCategoryId!}
                productId={productId}
                itemId={itemId}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ── SelectedProductRow ── */

function SelectedProductRow({
  categoryId,
  productId,
  itemId,
}: {
  categoryId: number
  productId: number
  itemId: number
}) {
  const { data } = useRequest(() => getCategoryProductsApi(categoryId), {
    initialData: { products: [] },
  })
  const products: Product[] = data.products
  const product = products.find((p) => p.id === productId)
  const item = product?.items.find((it) => it.id === itemId)

  if (!product || !item) {
    return <li className="text-muted-foreground text-xs">Cargando...</li>
  }

  return (
    <li className="flex items-start justify-between gap-1 text-xs">
      <span>
        {product.name} <span className="text-primary font-semibold">{item.name}</span>
      </span>
      <span className="shrink-0 font-medium">{formatPrice(item.price)}</span>
    </li>
  )
}
