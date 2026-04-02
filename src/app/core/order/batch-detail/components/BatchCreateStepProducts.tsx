import { Button } from '@/app/components/ui/button'
import CategorySidebar from '@/customers/orders/components/CategorySidebar'
import ProductGrid from '@/customers/orders/components/ProductGrid'
import SelectedProductsSummary from '@/customers/orders/components/SelectedProductsSummary'
import type { Category } from '@/shared/types/category'

interface BatchCreateStepProductsProps {
  categories: Category[]
  activeCategoryId: number | null
  onCategorySelect: (id: number) => void
  selectedProducts: Record<number, number[]>
  onItemSelect: (productId: number, itemIds: number[]) => void
  onClearProducts: () => void
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
}

export default function BatchCreateStepProducts({
  categories,
  activeCategoryId,
  onCategorySelect,
  selectedProducts,
  onItemSelect,
  onClearProducts,
  onSubmit,
  onBack,
  submitting,
}: BatchCreateStepProductsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar de categorías */}
        <div className="lg:col-span-1">
          <h3 className="mb-4 font-semibold">Categorías</h3>
          <CategorySidebar
            categories={categories}
            activeCategoryId={activeCategoryId}
            onCategorySelect={onCategorySelect}
          />
        </div>

        {/* Grid de productos */}
        <div className="lg:col-span-3">
          {activeCategoryId ? (
            <ProductGrid
              categoryId={activeCategoryId}
              selectedProducts={selectedProducts}
              onItemSelect={onItemSelect}
            />
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              Selecciona una categoría para ver los protocolos disponibles
            </div>
          )}
        </div>
      </div>

      {/* Resumen de productos seleccionados */}
      <SelectedProductsSummary selectedProducts={selectedProducts} onClear={onClearProducts} />

      {/* Botones de acción */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button onClick={onSubmit} disabled={submitting}>
          Crear lote
        </Button>
      </div>
    </div>
  )
}
