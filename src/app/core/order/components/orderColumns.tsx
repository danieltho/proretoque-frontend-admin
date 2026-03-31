import type { ColumnDef } from '@tanstack/react-table'
import {
  NotePencilIcon,
  FilesIcon,
  DotsThreeOutlineVerticalIcon,
} from '@phosphor-icons/react'
import { formatDateShort } from '@/app/shared/utils/date'
import type { OrderAdmin } from '../types/orderAdmin'
import { OrderAdminStatusBadge } from './OrderAdminStatusBadge'
import { OrderAdminActionBadge } from './OrderAdminActionBadge'
import { formatFileSize } from '@/app/shared/utils/fileSize'

function formatCurrency(amount: number | null): string {
  if (amount == null) return '--'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

interface OrderColumnsOptions {
  onEdit: (id: number) => void
  onDetail: (id: number) => void
}

export function getOrderColumns({
  onEdit,
  onDetail,
}: OrderColumnsOptions): ColumnDef<OrderAdmin>[] {
  return [
    {
      accessorKey: 'number',
      header: () => <span className="text-footer font-medium text-blue-200">ID</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">#{row.original.number}</span>
      ),
      size: 30,
    },
    {
      accessorKey: 'customer_name',
      header: () => <span className="text-footer font-medium text-blue-200">CLIENTE</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.client_name}</span>
      ),
      size: 300,
    },
    {
      accessorKey: 'total_file',
      header: () => <span className="text-footer font-medium text-blue-200">Nº FOTOS</span>,
      cell: ({ row }) => (
        <span className="text-right text-footer text-neutral-600">
          {row.original.total_file}
        </span>
      ),
      size: 30,
    },
    {
      accessorKey: 'total_size',
      header: () => <span className="text-footer font-medium text-blue-200">TAMAñO</span>,
      cell: ({ row }) => (
        <span className="text-right text-footer text-neutral-600">
          {formatFileSize(row.original.total_size ?? 0)}
        </span>
      ),
      size: 30,
    },
    {
      accessorKey: 'created_at',
      header: () => <span className="text-footer font-medium text-blue-200">CREADO</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">
          {formatDateShort(row.original.created_at)}
        </span>
      ),
      size: 30,
    },
    {
      accessorKey: 'deadline',
      header: () => <span className="text-footer font-bold text-blue-200">DEADLINE</span>,
      cell: ({ row }) => (
        <span className="text-footer font-bold text-neutral-600">
          {formatDateShort(row.original.deadline)}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: 'subtotal',
      header: () => <span className="text-footer font-medium text-blue-200">SUBTOTAL</span>,
      cell: ({ row }) => (
        <span className="text-right text-footer text-neutral-600">
          {formatCurrency(row.original.subtotal)}
        </span>
      ),
      size: 30,
    },
    {
      accessorKey: 'iva',
      header: () => <span className="text-footer font-medium text-blue-200">IVA</span>,
      cell: ({ row }) => (
        <span className="text-right text-footer text-neutral-600">
          {formatCurrency(row.original.iva)}
        </span>
      ),
      size: 30,
    },
    {
      accessorKey: 'total',
      header: () => <span className="text-footer font-medium text-blue-200">TOTAL</span>,
      cell: ({ row }) => (
        <span className="text-right text-footer font-semibold text-neutral-600">
          {formatCurrency(row.original.total)}
        </span>
      ),
      
    },
    
    {
      id: 'status',
      header: () => <span className="text-footer font-medium text-blue-200">ESTADO</span>,
      cell: ({ row }) => (
        <OrderAdminStatusBadge status={row.original.status} date={row.original.status_date} />
      ),
      
    },
    
    {
      id: 'actions',
      header: () => <span className="text-footer font-medium text-blue-200">ACCIONES</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="cursor-pointer text-neutral-600 hover:text-neutral-350"
            onClick={() => onEdit(row.original.id)}
          >
            <NotePencilIcon/>
          </button>
          <button
            type="button"
            className="cursor-pointer text-neutral-600 hover:text-neutral-350"
            onClick={() => onDetail(row.original.id)}
          >
            <FilesIcon/>
          </button>
          <button
            type="button"
            className="cursor-pointer text-neutral-600 hover:text-neutral-350"
          >
            <DotsThreeOutlineVerticalIcon/>
          </button>
        </div>
      ),
    },
  ]
}
