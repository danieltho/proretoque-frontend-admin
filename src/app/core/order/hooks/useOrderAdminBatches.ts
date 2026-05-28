import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWatcher } from 'alova/client'
import { getBatchColumns } from '../components/batchColumns'
import {
  getOrderAdminBatchesApi,
  sortOrderAdminBatchesApi,
  updateBatchNameApi,
  createBatchAdminApi,
} from '../api/orderApi'
import type { OrderAdminBatch } from '../types/orderDetailType'
import { parseRouteId } from '@/app/shared/utils/routeId'

interface UseOrderAdminBatchesOptions {
  onUploadFiles?: (batchId: number) => void
  onRetouches?: (batchId: number) => void
  onDeliveryOptions?: (batchId: number) => void
}
// esto es una actualizacion
export function useOrderAdminBatches({
  onUploadFiles,
  onRetouches,
  onDeliveryOptions,
}: UseOrderAdminBatchesOptions = {}) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const routeId = parseRouteId(id)
  const [page, setPage] = useState(1)

  const { data, loading, send } = useWatcher(
    () => getOrderAdminBatchesApi(routeId ?? 0, page, 'sort_order', 'asc'),
    [page],
    {
      immediate: routeId !== null,
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
        t,
        onEdit: (batchId) => navigate(`/batch/${batchId}`),
        onDelete: () => {},
        onRename: handleRename,
        onUploadFiles,
        onRetouches,
        onDeliveryOptions,
      }),
    [t, navigate, handleRename, onUploadFiles, onRetouches, onDeliveryOptions],
  )

  const totalPages = data.pages

  const handleReorder = useCallback(
    async (reordered: OrderAdminBatch[]) => {
      if (routeId === null) return
      const batchIds = reordered.map((b) => b.id)
      await sortOrderAdminBatchesApi(routeId, batchIds).send()
      send()
    },
    [routeId, send],
  )

  const handleAddBatch = useCallback(async () => {
    if (routeId === null) return
    const batchCount = data.batches.length
    const name = `Lote ${batchCount + 1}`
    await createBatchAdminApi(routeId, name).send()
    send()
  }, [routeId, data.batches.length, send])

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
