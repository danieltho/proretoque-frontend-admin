import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { NotePencilIcon, XIcon, ListIcon } from '@phosphor-icons/react'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'
import type { ProductItem } from '../types/product'

type EditableField = 'name' | 'price' | 'duration_task'

interface ProductItemColumnsOptions {
  onEdit: (item: ProductItem) => void
  onDelete: (id: number) => void
  onUpdateField: (itemId: number, field: EditableField, value: string | number) => void
}

function InlineCell({
  value,
  type = 'text',
  onSave,
}: {
  value: string | number
  type?: 'text' | 'number'
  onSave: (val: string | number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))

  const commit = () => {
    const result = type === 'number' ? Number(draft) : draft.trim()
    if (type === 'number' && isNaN(result as number)) {
      setEditing(false)
      return
    }
    if (result !== '' && result !== value) onSave(result)
    setEditing(false)
  }

  if (editing) {
    return (
      <Input
        type={type}
        step={type === 'number' ? '0.01' : undefined}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        autoFocus
        className="h-7 w-full text-footer"
      />
    )
  }

  return (
    <span
      className="cursor-pointer text-footer text-neutral-600 hover:text-blue-200"
      onClick={() => {
        setDraft(String(value))
        setEditing(true)
      }}
    >
      {value}
    </span>
  )
}

export function getProductItemColumns({
  onEdit,
  onDelete,
  onUpdateField,
}: ProductItemColumnsOptions): ColumnDef<ProductItem>[] {
  return [
    {
      id: 'drag',
      header: () => <span className="text-footer font-medium text-blue-200" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="text-footer text-neutral-600">{row.original.sort_order}</span>
          <ListIcon className="text-neutral-400" />
        </div>
      ),
      size: 50,
    },
    {
      accessorKey: 'name',
      header: () => <span className="text-footer font-medium text-blue-200">NOMBRES</span>,
      cell: ({ row }) => (
        <InlineCell
          value={row.original.name}
          onSave={(val) => onUpdateField(row.original.id, 'name', val)}
        />
      ),
    },
    {
      accessorKey: 'price',
      header: () => <span className="text-footer font-medium text-blue-200">PRECIO</span>,
      cell: ({ row }) => (
        <InlineCell
          value={row.original.price}
          type="number"
          onSave={(val) => onUpdateField(row.original.id, 'price', val)}
        />
      ),
    },
    {
      accessorKey: 'duration_task',
      header: () => <span className="text-footer font-medium text-blue-200">TIEMPO</span>,
      cell: ({ row }) => (
        <InlineCell
          value={row.original.duration_task}
          type="number"
          onSave={(val) => onUpdateField(row.original.id, 'duration_task', val)}
        />
      ),
    },
    {
      accessorKey: 'lang',
      header: () => <span className="text-footer font-medium text-blue-200">IDIOMA</span>,
      cell: ({ row }) => (
        <Badge className="rounded-lg bg-blue-200 px-2.5 py-0.5 text-footer font-medium text-white">
          {(row.original.lang || 'ES').toUpperCase()}
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
            onClick={() => onEdit(row.original)}
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
