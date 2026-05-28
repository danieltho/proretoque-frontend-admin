import type { ColumnDef } from '@tanstack/react-table'
import { NotePencilIcon, TrashIcon } from '@phosphor-icons/react'
import type { Client } from '../types/client'
import { MembershipBadge } from './MembershipBadge'

interface ClientColumnsOptions {
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  t: (key: string) => string
}

export function getClientColumns({
  t,
  onEdit,
  onDelete,
}: ClientColumnsOptions): ColumnDef<Client>[] {
  return [
    {
      accessorKey: 'id',
      header: () => <span className="text-footer font-medium text-blue-200">{t('columns.id')}</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">#{row.original.id}</span>
      ),
      size: 60,
    },
    {
      accessorKey: 'username',
      header: () => <span className="text-footer font-medium text-blue-200">{t('columns.username')}</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.username}</span>
      ),
    },
    {
      accessorKey: 'email',
      header: () => <span className="text-footer font-medium text-blue-200">{t('columns.email')}</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'firstname',
      header: () => (
        <span className="text-footer font-medium text-blue-200">{t('columns.fullName')}</span>
      ),
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">
          {row.original.firstname} {row.original.lastname}
        </span>
      ),
    },
    {
      id: 'membership',
      header: () => <span className="text-footer font-medium text-blue-200">{t('columns.membership')}</span>,
      cell: ({ row }) => (
        <MembershipBadge name={row.original.membership_tier.name} />
      ),
    },
    {
      id: 'actions',
      header: () => <span className="text-footer font-medium text-blue-200">{t('columns.actions')}</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="cursor-pointer text-neutral-600 hover:text-neutral-350"
            onClick={() => onEdit(row.original.id)}
          >
            <NotePencilIcon />
          </button>
          <button
            type="button"
            className="cursor-pointer text-neutral-600 hover:text-neutral-350"
            onClick={() => onDelete(row.original.id)}
          >
            <TrashIcon  />
          </button>
        </div>
      ),
    },
  ]
}
