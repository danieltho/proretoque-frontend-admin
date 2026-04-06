import { useCallback, useState } from 'react'
import { SortableDataTable } from '@/app/components/ui/sortable-data-table'
import { useOrderAdminBatches } from '../hooks/useOrderAdminBatches'
import { useOrderForm } from '../hooks/useOrderForm'
import { Pagination } from '@/app/shared/ui/Pagination'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { PlusCircleIcon } from '@phosphor-icons/react'
import { BatchManageModal } from '../modal/BatchManageModal'

export default function BatchDataTableSortable() {
  const [manageBatchId, setManageBatchId] = useState<number | null>(null)
  const { order } = useOrderForm()

  const {
    batches,
    columns,
    page,
    setPage,
    totalPages,
    loading,
    handleReorder,
    handleAddBatch,
    refetch,
  } = useOrderAdminBatches({
    onUploadFiles: setManageBatchId,
    onRetouches: setManageBatchId,
    onDeliveryOptions: setManageBatchId,
  })

  const batchList = batches.map((b) => ({ id: b.id, name: b.name }))

  const handleAddAndOpen = useCallback(async () => {
    await handleAddBatch()
  }, [handleAddBatch])

  if (loading && batches.length === 0) return <div>Cargando lotes...</div>

  return (
    <>
      <header>
        <TitleSection
          title="Resumen de Lotes"
          actions={[
            {
              label: 'Agregar Lote',
              onClick: handleAddAndOpen,
              icon: PlusCircleIcon,
              variant: 'outline',
            },
          ]}
        />
      </header>
      <SortableDataTable columns={columns} data={batches} onReorder={handleReorder} />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <BatchManageModal
        open={manageBatchId !== null}
        batches={batchList}
        initialBatchId={manageBatchId}
        orderName={order?.name ?? ''}
        orderNumber={order?.number ?? ''}
        onClose={() => {
          setManageBatchId(null)
          refetch()
        }}
        onSaved={refetch}
        onAddBatch={handleAddBatch}
      />
    </>
  )
}
