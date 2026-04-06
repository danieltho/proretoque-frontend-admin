import type { ColumnDef } from '@tanstack/react-table'
import { NotePencilIcon, XIcon } from '@phosphor-icons/react'
import { Badge } from '@/app/components/ui/badge'
import type { User } from '../types/user'

interface UserColumnsOptions {
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

export function getUserColumns({ onEdit, onDelete }: UserColumnsOptions): ColumnDef<User>[] {
  return [
    {
      accessorKey: 'id',
      header: () => <span className="text-footer font-medium text-blue-200">ID</span>,
      cell: ({ row }) => <span className="text-footer text-neutral-600">#{row.original.id}</span>,
      size: 50,
    },
    {
      accessorKey: 'email',
      header: () => <span className="text-footer font-medium text-blue-200">EMAIL</span>,
      cell: ({ row }) => <span className="text-footer text-neutral-600">{row.original.email}</span>,
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
      accessorKey: 'role',
      header: () => <span className="text-footer font-medium text-blue-200">ROLES</span>,
      cell: ({ row }) => (
        <Badge className="rounded-lg bg-blue-200 px-2.5 py-0.5 text-footer font-medium text-white">
          {(row.original.role?.name || '').toUpperCase()}
        </Badge>
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
