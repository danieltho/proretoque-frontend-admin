import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/app/components/ui/data-table'
import type { OrderAdmin } from '../types/orderAdmin'
import { getOrderColumns } from './orderColumns'

interface OrdersTableProps {
  orders: OrderAdmin[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const columns = useMemo(
    () =>
      getOrderColumns({
        t,
        onEdit: (id) => navigate(`/orders/${id}/edit`),
        onDetail: (id) => navigate(`/orders/${id}`),
      }),
    [t, navigate],
  )

  return <DataTable columns={columns} data={orders} />
}
