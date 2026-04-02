import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWatcher } from 'alova/client'
import { getBatchColumns } from '../components/batchColumns'
import {
  getOrderAdminBatchesApi,
  sortOrderAdminBatchesApi,
  updateBatchNameApi,
  createBatchAdminApi,
} from '../api/orderApi'
import type { OrderAdminBatch } from '../types/orderDetailType'

interface UseOrderAdminBatchesOptions {
  onUploadFiles?: (batchId: number) => void
}

export function useOrderAdminBatches({ onUploadFiles }: UseOrderAdminBatchesOptions = {}) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { data, loading, send } = useWatcher(
    () => getOrderAdminBatchesApi(Number(id!), page, 'sort_order', 'asc'),
    [page],
    {
      immediate: true,
      force: true,
      initialData: { batches: [], count: 0, pages: 1 },
    },
  )

  const handleRename = useCallback(
    async (batchId: number, name: string) => {
      await updateBatchNameApi(batchId, name).send()
      send()
    },
    [send],
  )

  const columns = useMemo(
    () =>
      getBatchColumns({
        onEdit: (batchId) => navigate(`/batch/${batchId}`),
        onDelete: () => {},
        onRename: handleRename,
        onUploadFiles,
      }),
    [navigate, handleRename, onUploadFiles],
  )

  const totalPages = data.pages

  const handleReorder = useCallback(
    async (reordered: OrderAdminBatch[]) => {
      if (!id) return
      const batchIds = reordered.map((b) => b.id)
      await sortOrderAdminBatchesApi(Number(id), batchIds).send()
      send()
    },
    [id, send],
  )

  const handleAddBatch = useCallback(async () => {
    if (!id) return
    const batchCount = data.batches.length
    const name = `Lote ${batchCount + 1}`
    await createBatchAdminApi(Number(id), name).send()
    send()
  }, [id, data.batches.length, send])

  return {
    batches: data.batches,
    columns,
    page,
    setPage,
    totalPages,
    loading,
    handleReorder,
    handleAddBatch,
    refetch: send,
  }
}
