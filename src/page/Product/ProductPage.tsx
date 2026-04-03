import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRequest } from 'alova/client'
import { PlusCircleIcon } from '@phosphor-icons/react'
import { getProductsAdminApi, deleteProductAdminApi } from '@/app/core/product/api/productsAdminApi'
import { ProductsTable } from '@/app/core/product/components/ProductsTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Pagination } from '@/app/shared/ui/Pagination'
import { Skeleton } from '@/app/components/ui/skeleton'
import Template from '@/app/components/Template'

const ITEMS_PER_PAGE = 20

export default function ProductPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)

  const { data, loading, error, send } = useRequest(getProductsAdminApi(currentPage), {
    force: true,
  })

  const products = data?.products ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

  const handleDelete = async (id: number) => {
    await deleteProductAdminApi(id).send()
    send()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    getProductsAdminApi(page)
      .send()
      .then(() => send())
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          breadcrumbs={[{ label: 'Administrador' }]}
          title="Productos"
          action={{
            label: 'Crear Nuevo',
            icon: PlusCircleIcon,
            onClick: () => navigate('/products/new'),
          }}
        />

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No hay productos registrados.</p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <ProductsTable products={products} onDelete={handleDelete} />
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
