import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatcher } from 'alova/client'
import { PlusCircleIcon } from '@phosphor-icons/react'
import { getOrdersApi } from '@/app/core/order/api/ordersApi'
import { OrdersTable } from '@/app/core/order/components/OrdersTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Skeleton } from '@/app/components/ui/skeleton'
import Template from '@/app/components/Template'
import { Pagination } from '@/app/shared/ui/Pagination'
import { calculateTotalPage } from '@/app/shared/utils/pagination'
import { useTranslation } from 'react-i18next'



export default function OrderPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)

  const { data, loading, error, send } = useWatcher(
    () => getOrdersApi(currentPage),
    [currentPage],
    { immediate: true, force: true }
  )

  const orders = data?.orders ?? []
  const totalCount = data?.count ?? 0
  const totalPages = calculateTotalPage(totalCount, data?.pages)
  
  const {t} = useTranslation()

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          title="Pedidos"
          action={{
            label: 'Crear Nuevo',
            icon: PlusCircleIcon,
            onClick: () => navigate('/orders/new'),
            variant: 'blue'
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
            {t('tables.empty')}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <OrdersTable orders={orders} />
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
