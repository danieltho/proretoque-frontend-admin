import { useState } from 'react'
import { useWatcher } from 'alova/client'
import { getClientsApi, deleteClientApi } from '@/app/core/client/api/clientsApi'
import { ClientsTable } from '@/app/core/client/components/ClientsTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Pagination } from '@/app/shared/ui/Pagination'
import { Skeleton } from '@/app/components/ui/skeleton'
import Template from '@/app/components/Template'

export default function ClientPage() {
  const [currentPage, setCurrentPage] = useState(1)

  const { data, loading, error, send } = useWatcher(
    () => getClientsApi(currentPage),
    [currentPage],
    { immediate: true, force: true },
  )

  const clients = data?.customers ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.max(1, Math.floor(totalCount / data?.pages))

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
          breadcrumbs={[{ label: 'Usuarios' }]}
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
            No hay clientes registrados.
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
