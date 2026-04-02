import { useOrderEdit } from '../context/OrderEditContext'
import EditBatchTabs from './EditBatchTabs'
import EditProductGrid from './EditProductGrid'
import CategorySidebar from '../../components/CategorySidebar'

export default function EditStepRetoques() {
  const { categories, categoryGroups, activeCategoryId, activeBatchId, setSelectedCategoryId } =
    useOrderEdit()

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <EditBatchTabs />

        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          {/* Col 1: Categories sidebar */}
          <div className="w-44 shrink-0 overflow-y-auto rounded-lg border p-4">
            {categoryGroups && categoryGroups.length > 0 ? (
              <CategorySidebar
                categoryGroups={categoryGroups}
                activeCategoryId={activeCategoryId}
                onCategorySelect={setSelectedCategoryId}
              />
            ) : (
              <CategorySidebar
                categories={categories}
                activeCategoryId={activeCategoryId}
                onCategorySelect={setSelectedCategoryId}
              />
            )}
          </div>

          {/* Col 2: Products grid */}
          <div className="min-w-0 flex-1 overflow-y-auto rounded-lg border">
            {activeCategoryId && <EditProductGrid key={`${activeBatchId}-${activeCategoryId}`} />}
          </div>
        </div>
      </div>
    </div>
  )
}
