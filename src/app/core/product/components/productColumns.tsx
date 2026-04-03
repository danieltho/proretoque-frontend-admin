import type { ColumnDef } from '@tanstack/react-table'
import { NotePencilIcon, XIcon, ListIcon } from '@phosphor-icons/react'
import type { ProductAdmin } from '../types/product'
import { CategoryBadge } from './CategoryBadge'

interface ProductColumnsOptions {
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

export function getProductColumns({
  onEdit,
  onDelete,
}: ProductColumnsOptions): ColumnDef<ProductAdmin>[] {
  return [
    {
      accessorKey: 'sort_order',
      header: () => <span className="text-footer font-medium text-blue-200" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="text-footer text-neutral-600">{row.original.sort_order}</span>
          <ListIcon className="text-neutral-400" />
        </div>
      ),
      size: 60,
    },
    {
      accessorKey: 'name',
      header: () => <span className="text-footer font-medium text-blue-200">Productos</span>,
      cell: ({ row }) => <span className="text-footer text-neutral-600">{row.original.name}</span>,
    },
    {
      id: 'categories',
      header: () => <span className="text-footer font-medium text-blue-200">Categorías</span>,
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1">
          {row.original.categories.map((cat) => (
            <CategoryBadge key={cat.id} name={cat.name} />
          ))}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="text-footer font-medium text-blue-200">Acciones</span>,
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
            <XIcon />
          </button>
        </div>
      ),
    },
  ]
}
