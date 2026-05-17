import { useState } from 'react'
import { useWatcher } from 'alova/client'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import {
  getProtocolsAdminApi,
  deleteProtocolAdminApi,
} from '@/app/core/protocol/api/protocolsAdminApi'
import { ProtocolsTable } from '@/app/core/protocol/components/ProtocolsTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import Template from '@/app/components/Template'
import { ProtocolSkeleton } from '@/app/core/protocol/components/ProtocolSkeleton'
import { ProtocolEmptyState } from '@/app/core/protocol/components/ProtocolEmptyState'
import { Pagination } from '@/app/shared/ui/Pagination'
import { calculateTotalPage } from '@/app/shared/utils/pagination'

export default function ProtocolPage() {
  const [currentPage, setCurrentPage] = useState(1)

  const { data, loading, send } = useWatcher(
    () => getProtocolsAdminApi(currentPage),
    [currentPage],
    { immediate: true, force: true },
  )

  const protocols = data?.protocols ?? []
  const totalCount = data?.count ?? 0
  const totalPages = calculateTotalPage(totalCount, data?.pages)

  const handleDelete = async (id: number) => {
    await deleteProtocolAdminApi(id).send()
    send()
  }

  const onPageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          title="Protocolos"
          action={{ variant: 'blue', label: 'Crear', onClick: () => {} }}
        />

        {loading ? (
          <ProtocolSkeleton />
        ) : protocols.length === 0 ? (
          <ProtocolEmptyState />
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <ProtocolsTable protocols={protocols} onDelete={handleDelete} />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </Template>
  )
}
