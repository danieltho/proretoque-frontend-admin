import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatcher } from 'alova/client'
import { PlusCircleIcon } from '@phosphor-icons/react'
import { getProtocols, deleteProtocol } from '@/app/core/protocol/api/protocolsApi'
import { ProtocolsTable } from '@/app/core/protocol/components/ProtocolsTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Skeleton } from '@/app/components/ui/skeleton'
import Template from '@/app/components/Template'
import { Pagination } from '@/app/shared/ui/Pagination'
import ProtocolSkeleton from './ProtocolSkeleton'
import { EmptyState } from './EmptyState'

export default function ProtocolPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const { data, loading, error, send } = useWatcher(
    () =>
      getProtocols(currentPage, {
        name: search || undefined,
        status: selectedStatus || undefined,
      }),
    [currentPage, search, selectedStatus],
    { immediate: true, force: true, debounce: [0, 300, 0] },
  )

  const protocols = data?.protocols ?? []
  const totalPages = data?.pages ?? 1

  const handleDelete = async (id: number) => {
    await deleteProtocol(id).send()
    send()
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (status: string | null) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          title="Protocolos"
          action={{
            variant: 'blue',
            label: 'Crear Nuevo',
            icon: PlusCircleIcon,
            onClick: () => navigate('/protocol/new'),
          }}
        />

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        {loading && protocols.length === 0 ? (
          <ProtocolSkeleton />
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <ProtocolsTable
                protocols={protocols}
                search={search}
                onSearchChange={handleSearchChange}
                selectedStatus={selectedStatus}
                onStatusChange={handleStatusChange}
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
