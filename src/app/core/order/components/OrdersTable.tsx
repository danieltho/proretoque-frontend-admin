import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/app/components/ui/data-table'
import type { OrderAdmin } from '../types/orderAdmin'
import { getOrderColumns } from './orderColumns'

interface OrdersTableProps {
  orders: OrderAdmin[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const navigate = useNavigate()

  const columns = useMemo(
    () =>
      getOrderColumns({
        onEdit: (id) => navigate(`/orders/${id}/edit`),
        onDetail: (id) => navigate(`/orders/${id}`),
      }),
    [navigate],
  )

  return <DataTable columns={columns} data={orders} />
}
