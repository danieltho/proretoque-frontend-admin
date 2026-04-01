import { useState } from 'react'
import { useWatcher } from 'alova/client'
import { getClients, deleteClientApi } from '@/app/core/client/api/clientsApi'
import { ClientsTable } from '@/app/core/client/components/ClientsTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Pagination } from '@/app/shared/ui/Pagination'
import { Skeleton } from '@/app/components/ui/skeleton'
import Template from '@/app/components/Template'
import { calculateTotalPage } from '@/app/shared/utils/pagination'
import { useTranslation } from 'react-i18next'

export default function ClientPage() {
  const [currentPage, setCurrentPage] = useState(1)

  const { data, loading, error, send } = useWatcher(
    () => getClients(currentPage),
    [currentPage],
    { immediate: true, force: true },
  )

  const clients = data?.customers ?? []
  const totalCount = data?.count ?? 0
  const totalPages = calculateTotalPage(totalCount, data?.pages)

  const {t} = useTranslation()

  const handleDelete = async (id: number) => {
    await deleteClientApi(id).send()
    send()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          title="Clientes"
        />

        {error && (
          <p className="text-sm text-destructive">{error.message}</p>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {t('tables.empty')}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <ClientsTable clients={clients} onDelete={handleDelete} />
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
