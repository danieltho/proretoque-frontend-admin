import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRequest } from 'alova/client'
import { CaretLeftIcon, CaretRightIcon, PlusCircleIcon } from '@phosphor-icons/react'
import { getOrdersAdminApi } from '@/app/core/order/api/ordersAdminApi'
import { OrdersAdminTable } from '@/app/core/order/components/OrdersAdminTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Skeleton } from '@/app/components/ui/skeleton'
import Template from '@/app/components/Template'

const ITEMS_PER_PAGE = 20

export default function OrderPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)

  const { data, loading, error, send } = useRequest(
    getOrdersAdminApi(currentPage, ITEMS_PER_PAGE),
    { force: true },
  )

  const orders = data?.orders ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    getOrdersAdminApi(page, ITEMS_PER_PAGE)
      .send()
      .then(() => send())
  }

  const getVisiblePages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | 'ellipsis')[] = [1]
    if (currentPage > 3) pages.push('ellipsis')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('ellipsis')
    if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          breadcrumbs={[{ label: 'Presupuestos' }]}
          title="Presupuestos"
          action={{
            label: 'Crear Nuevo',
            icon: PlusCircleIcon,
            onClick: () => navigate('/orders/new'),
          }}
        />

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No hay presupuestos registrados.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <OrdersAdminTable orders={orders} />
            </div>

            {totalPages > 1 && (
              <nav className="flex items-center gap-1">
                <button
                  className="flex h-9 items-center gap-1 rounded-md px-3 py-2 text-body font-medium text-neutral-600 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <CaretLeftIcon className="size-4" />
                  Previous
                </button>

                {getVisiblePages().map((page, idx) =>
                  page === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex size-9 items-center justify-center text-body text-neutral-600"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`flex size-9 items-center justify-center rounded-md text-body font-medium ${
                        page === currentPage
                          ? 'bg-blue-200 text-white shadow-sm'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  className="flex h-9 items-center gap-1 rounded-md px-3 py-2 text-body font-medium text-neutral-600 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                  <CaretRightIcon className="size-4" />
                </button>
              </nav>
            )}
          </div>
        )}
      </div>
    </Template>
  )
}
