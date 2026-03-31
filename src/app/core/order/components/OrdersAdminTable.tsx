import { useNavigate } from 'react-router-dom'
import {
  NotePencilIcon,
  FilesIcon,
  DotsThreeOutlineVerticalIcon,
} from '@phosphor-icons/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import { formatDateShort } from '@/app/shared/utils/date'
import type { OrderAdmin } from '../types/orderAdmin'
import { OrderAdminStatusBadge } from './OrderAdminStatusBadge'
import { OrderAdminActionBadge } from './OrderAdminActionBadge'

interface OrdersAdminTableProps {
  orders: OrderAdmin[]
}

function formatCurrency(amount: number | null): string {
  if (amount == null) return '--'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

export function OrdersAdminTable({ orders }: OrdersAdminTableProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-neutral-200">
          <TableHead className="w-15 text-footer font-medium text-blue-200">ID</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">CLIENTE</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">SUBTOTAL</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">IVA</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">TOTAL</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">CREADO</TableHead>
          <TableHead className="w-52 text-footer font-medium text-blue-200">ESTADO</TableHead>
          <TableHead className="w-46 text-footer font-medium text-blue-200">TAREAS</TableHead>
          <TableHead className="text-footer font-medium text-blue-200">ACCIONES</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className="border-b border-neutral-200 hover:bg-neutral-100"
          >
            <TableCell className="w-15 text-footer text-neutral-600">
              #{order.number}
            </TableCell>
            <TableCell className="text-footer text-neutral-600">
              {order.customer_name}
            </TableCell>
            <TableCell className="text-right text-footer text-neutral-600">
              {formatCurrency(order.subtotal)}
            </TableCell>
            <TableCell className="text-right text-footer text-neutral-600">
              {formatCurrency(order.iva)}
            </TableCell>
            <TableCell className="text-right text-footer font-semibold text-neutral-600">
              {formatCurrency(order.total)}
            </TableCell>
            <TableCell className="text-footer text-neutral-600">
              {formatDateShort(order.created_at)}
            </TableCell>
            <TableCell className="w-52">
              <OrderAdminStatusBadge status={order.status} date={order.status_date} />
            </TableCell>
            <TableCell className="w-46">
              <OrderAdminActionBadge action={order.action} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => navigate(`/orders/${order.id}/edit`)}
                >
                  <NotePencilIcon className="size-4" />
                </button>
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <FilesIcon className="size-4" />
                </button>
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                >
                  <DotsThreeOutlineVerticalIcon className="size-4" weight="fill" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
