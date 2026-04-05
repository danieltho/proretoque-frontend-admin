import { useState } from 'react'
import { useRequest } from 'alova/client'
import { PlusCircleIcon } from '@phosphor-icons/react'
import {
  getCategoriesAdminApi,
  createCategoryAdminApi,
  updateCategoryAdminApi,
  sortCategoriesAdminApi,
  deleteCategoryAdminApi,
} from '@/app/core/category/api/categoriesAdminApi'
import { CategoriesTable } from '@/app/core/category/components/CategoriesTable'
import { CategoryCreateBar } from '@/app/core/category/components/CategoryCreateBar'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Pagination } from '@/app/shared/ui/Pagination'
import { Skeleton } from '@/app/components/ui/skeleton'
import Template from '@/app/components/Template'
import type { CategoryAdmin } from '@/app/core/category/types/category'

const ITEMS_PER_PAGE = 20

export default function CategoryPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateBar, setShowCreateBar] = useState(false)

  const { data, loading, error, send } = useRequest(
    getCategoriesAdminApi(currentPage, ITEMS_PER_PAGE),
    { force: true },
  )

  const categories = data?.categories ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

  const handleCreate = async (name: string) => {
    await createCategoryAdminApi({ name }).send()
    setShowCreateBar(false)
    send()
  }

  const handleUpdate = async (id: number, name: string) => {
    await updateCategoryAdminApi(id, { name }).send()
    send()
  }

  const handleDelete = async (id: number) => {
    await deleteCategoryAdminApi(id).send()
    send()
  }

  const handleReorder = async (reordered: CategoryAdmin[]) => {
    const ids = reordered.map((c) => c.id)
    await sortCategoriesAdminApi(ids).send()
    send()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    getCategoriesAdminApi(page, ITEMS_PER_PAGE)
      .send()
      .then(() => send())
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          breadcrumbs={[{ label: 'Administrador' }]}
          title="Categorías"
          action={{
            variant: 'blue',
            label: 'Crear categoría',
            icon: PlusCircleIcon,
            onClick: () => setShowCreateBar((prev) => !prev),
          }}
        />

        {showCreateBar && <CategoryCreateBar onSubmit={handleCreate} />}

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No hay categorías registradas.</p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <CategoriesTable
                categories={categories}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onReorder={handleReorder}
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </Template>
  )
}
