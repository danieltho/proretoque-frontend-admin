import type { ColumnDef } from '@tanstack/react-table'
import { NotePencilIcon, TrashIcon } from '@phosphor-icons/react'
import type { Provider } from '../types/provider'

interface ProviderColumnsOptions {
  onEdit: (id: number) => void
  onDelete?: (id: number) => void
}

export function getProviderColumns({
  onEdit,
  onDelete,
}: ProviderColumnsOptions): ColumnDef<Provider>[] {
  return [
    {
      accessorKey: 'id',
      header: () => <span className="text-footer font-medium text-blue-200">ID</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.id}</span>
      ),
      size: 60,
    },
    {
      accessorKey: 'username',
      header: () => <span className="text-footer font-medium text-blue-200">USERNAME</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.username}</span>
      ),
    },
    {
      id: 'fullname',
      header: () => (
        <span className="text-footer font-medium text-blue-200">NOMBRE Y APELLIDOS</span>
      ),
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">
          {row.original.firstname} {row.original.lastname}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: () => <span className="text-footer font-medium text-blue-200">EMAIL</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'company',
      header: () => <span className="text-footer font-medium text-blue-200">COMPAÑÍA</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">
          {row.original.company ?? '--'}
        </span>
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
            <NotePencilIcon />
          </button>
          {onDelete && (
            <button
              type="button"
              className="cursor-pointer text-neutral-600 hover:text-neutral-350"
              onClick={() => onDelete(row.original.id)}
            >
              <TrashIcon />
            </button>
          )}
        </div>
      ),
    },
  ]
}
