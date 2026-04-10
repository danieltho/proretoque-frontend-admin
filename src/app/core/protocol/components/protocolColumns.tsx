import type { ColumnDef } from '@tanstack/react-table'
import { FilesIcon, NotePencilIcon, XIcon } from '@phosphor-icons/react'
import { formatDateShort, formatDateTime } from '@/app/shared/utils/date'
import type { ProtocolAdmin } from '../types/protocol'
import { ProtocolStatusBadge } from './ProtocolStatusBadge'

interface ProtocolColumnsOptions {
  onEdit: (id: number) => void
  onDuplicate: (id: number) => void
  onDelete: (id: number) => void
}

export function getProtocolColumns({
  onEdit,
  onDuplicate,
  onDelete,
}: ProtocolColumnsOptions): ColumnDef<ProtocolAdmin>[] {
  return [
    {
      accessorKey: 'id',
      header: () => <span className="text-footer font-medium text-blue-200">ID</span>,
      size: 50,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">#{row.original.id}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: () => <span className="text-footer font-medium text-blue-200">TÍTULOS</span>,
      cell: ({ row }) => <span className="text-footer text-neutral-600">{row.original.name}</span>,
    },
    {
      accessorKey: 'code',
      header: () => <span className="text-footer font-medium text-blue-200">CÓDIGO</span>,
      cell: ({ row }) => <span className="text-footer text-neutral-600">{row.original.code}</span>,
    },
    {
      accessorKey: 'created_at',
      header: () => <span className="text-footer font-medium text-blue-200">CREADO</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">
          {formatDateShort(row.original.created_at)}
        </span>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: () => (
        <span className="text-footer font-medium text-blue-200">ÚLTIMA MODIFICACIÓN</span>
      ),
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">
          {formatDateTime(row.original.updated_at)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <span className="text-footer font-medium text-blue-200">ESTADO</span>,
      cell: ({ row }) => <ProtocolStatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: () => <span className="text-footer font-medium text-blue-200">ACCIONES</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="cursor-pointer text-neutral-600 hover:text-neutral-350"
            onClick={() => onDuplicate(row.original.id)}
          >
            <FilesIcon className="size-4" />
          </button>
          <button
            type="button"
            className="cursor-pointer text-neutral-600 hover:text-neutral-350"
            onClick={() => onEdit(row.original.id)}
          >
            <NotePencilIcon className="size-4" />
          </button>
          <button
            type="button"
            className="cursor-pointer text-neutral-600 hover:text-neutral-350"
            onClick={() => onDelete(row.original.id)}
          >
            <XIcon className="size-4" />
          </button>
        </div>
      ),
    },
  ]
}
