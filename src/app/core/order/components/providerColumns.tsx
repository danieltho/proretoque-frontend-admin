import type { ColumnDef } from '@tanstack/react-table'
import { NotePencilIcon, DotsSixVerticalIcon } from '@phosphor-icons/react'
import { Checkbox } from '@/app/components/ui/checkbox'
import { formatDateShort } from '@/app/shared/utils/date'
import type { OrderAdminProvider } from '../types/orderDetailType'

function formatCurrency(amount: number | null): string {
  if (amount == null) return '--'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

interface ProviderColumnsOptions {
  onEdit: (id: number) => void
}

export function getProviderColumns({
  onEdit,
}: ProviderColumnsOptions): ColumnDef<OrderAdminProvider>[] {
  return [
    {
      id: 'drag',
      header: () => null,
      cell: () => (
        <DotsSixVerticalIcon className="size-4 cursor-grab text-neutral-400" />
      ),
      size: 30,
    },
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      size: 30,
    },
    {
      accessorKey: 'name',
      header: () => <span className="text-footer font-medium text-blue-200">NOMBRES</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: () => <span className="text-footer font-medium text-blue-200">FECHA</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">
          {formatDateShort(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: 'total_files',
      header: () => (
        <span className="text-footer font-medium text-blue-200">TOTAL DE ARCHIVOS</span>
      ),
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.total_files}</span>
      ),
    },
    {
      accessorKey: 'total_size',
      header: () => <span className="text-footer font-medium text-blue-200">TAMAÑO TOTAL</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.total_size}</span>
      ),
    },
    {
      accessorKey: 'retouch_count',
      header: () => <span className="text-footer font-medium text-blue-200">RETOQUES</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.retouch_count}</span>
      ),
    },
    {
      id: 'cost_per_photo',
      header: () => (
        <span className="text-footer font-medium text-blue-200">COSTO POR FOTO</span>
      ),
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">
          {formatCurrency(row.original.cost_per_photo)}
        </span>
      ),
    },
    {
      id: 'extra_cost',
      header: () => <span className="text-footer font-medium text-blue-200">COSTO EXTRA</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">
          {formatCurrency(row.original.extra_cost)}
        </span>
      ),
    },
    {
      accessorKey: 'deadline',
      header: () => <span className="text-footer font-medium text-blue-200">DEADLINE</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">
          {row.original.deadline ? formatDateShort(row.original.deadline) : '--'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="text-footer font-medium text-blue-200">ACCIONES</span>,
      cell: ({ row }) => (
        <button
          type="button"
          className="cursor-pointer text-neutral-600 hover:text-neutral-350"
          onClick={() => onEdit(row.original.id)}
        >
          <NotePencilIcon />
        </button>
      ),
    },
  ]
}
