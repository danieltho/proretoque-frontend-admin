import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useWatcher } from 'alova/client'
import { PlusCircleIcon } from '@phosphor-icons/react'
import { getProductsAdminApi, deleteProductAdminApi } from '@/app/core/product/api/productsAdminApi'
import { getCategoriesAdminApi } from '@/app/core/category/api/categoriesAdminApi'

import { ProductsTable } from '@/app/core/product/components/ProductsTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Pagination } from '@/app/shared/ui/Pagination'
import { Skeleton } from '@/app/components/ui/skeleton'
import Template from '@/app/components/Template'
import { Pagination } from '@/app/shared/ui/Pagination'
import type { SearchableSelectOption } from '@/app/components/ui/searchable-select'

export default function ProductPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [categoryOptions, setCategoryOptions] = useState<SearchableSelectOption[]>([])

  // Load category options for filter
  useEffect(() => {
    getCategoriesAdminApi(1, 100)
      .send()
      .then((res) => {
        setCategoryOptions(res.categories.map((c) => ({ id: c.id, label: c.name })))
      })
  }, [])

  const { data, loading, error, send } = useWatcher(
    () =>
      getProductsAdminApi(currentPage, {
        name: search || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      }),
    [currentPage, search, selectedCategories],
    { immediate: true, force: true, debounce: [0, 300, 0] },
  )

  const products = data?.products ?? []
  const totalPages = data?.pages ?? 1

  const handleDelete = async (id: number) => {
    await deleteProductAdminApi(id).send()
    send()
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleCategoriesChange = (ids: number[]) => {
    setSelectedCategories(ids)
    setCurrentPage(1)
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          breadcrumbs={[{ label: 'Administrador' }]}
          title="Productos"
          action={{
            variant: 'blue',
            label: 'Crear Nuevo',
            icon: PlusCircleIcon,
            onClick: () => navigate('/products/new'),
          }}
        />

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        {loading && products.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <ProductsTable
                products={products}
                search={search}
                onSearchChange={handleSearchChange}
                categoryOptions={categoryOptions}
                selectedCategories={selectedCategories}
                onCategoriesChange={handleCategoriesChange}
                onDelete={handleDelete}
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </Template>
  )
}
