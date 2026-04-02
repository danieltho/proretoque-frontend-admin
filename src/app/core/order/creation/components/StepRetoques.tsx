import ProductGrid from './ProductGrid'
import CategorySidebar from '../../components/CategorySidebar'
import { useOrderForm } from '../context/OrderFormContext'
import StepUpload from './StepUpload'

export default function StepRetoques() {
  const { categories, categoryGroups, activeCategoryId, activeBatchId, setSelectedCategoryId } =
    useOrderForm()

  const retoqueCategories =
    categoryGroups?.find((g) => g.tag === 'retoque')?.categories ?? categories ?? []

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          {/* Col 1: Categories sidebar */}
          <div className="w-44 shrink-0 overflow-y-auto rounded-lg border p-4">
            <CategorySidebar
              categories={retoqueCategories}
              activeCategoryId={activeCategoryId}
              onCategorySelect={setSelectedCategoryId}
            />
          </div>

          {/* Col 2: Products grid */}
          <div className="min-w-0 flex-1 overflow-y-auto rounded-lg border">
            {activeCategoryId && <ProductGrid key={`${activeBatchId}-${activeCategoryId}`} />}
          </div>
        </div>
        <StepUpload />
      </div>
    </div>
  )
}
