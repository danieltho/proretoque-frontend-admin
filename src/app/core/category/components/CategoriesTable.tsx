import { useMemo, useRef, useState } from 'react'
import { NotePencilIcon, XIcon, ListIcon, CheckIcon } from '@phosphor-icons/react'
import type { ColumnDef } from '@tanstack/react-table'
import { SortableDataTable } from '@/app/components/ui/sortable-data-table'
import { Input } from '@/app/components/ui/input'
import type { CategoryAdmin } from '../types/category'

interface CategoriesTableProps {
  categories: CategoryAdmin[]
  onUpdate: (id: number, name: string) => void
  onDelete: (id: number) => void
  onReorder: (reordered: CategoryAdmin[]) => void
}

function EditableNameCell({
  category,
  onUpdate,
}: {
  category: CategoryAdmin
  onUpdate: (id: number, name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(category.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setValue(category.name)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const save = () => {
    const trimmed = value.trim()
    if (trimmed && trimmed !== category.name) {
      onUpdate(category.id, trimmed)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') setEditing(false)
          }}
          onBlur={save}
          className="h-7 text-footer"
        />
        <button
          type="button"
          className="cursor-pointer text-green-600 hover:text-green-500"
          onMouseDown={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <CheckIcon className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <span
      className="cursor-pointer text-footer text-neutral-600 hover:text-blue-200"
      onClick={startEdit}
    >
      {category.name}
    </span>
  )
}

export function CategoriesTable({
  categories,
  onUpdate,
  onDelete,
  onReorder,
}: CategoriesTableProps) {
  const columns: ColumnDef<CategoryAdmin>[] = useMemo(
    () => [
      {
        id: 'drag',
        header: () => <span className="text-footer font-medium text-blue-200" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span className="text-footer text-neutral-600">{row.index + 1}</span>
            <ListIcon className="text-neutral-400" />
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: 'name',
        header: () => <span className="text-footer font-medium text-blue-200">NOMBRES</span>,
        cell: ({ row }) => (
          <EditableNameCell category={row.original} onUpdate={onUpdate} />
        ),
      },
      {
        id: 'actions',
        header: () => <span className="text-footer font-medium text-blue-200">ACCIONES</span>,
        cell: ({ row }) => (
          <button
            type="button"
            className="cursor-pointer text-neutral-600 hover:text-neutral-350"
            onClick={() => onDelete(row.original.id)}
          >
            <XIcon className="size-4" />
          </button>
        ),
      },
    ],
    [onUpdate, onDelete],
  )

  return <SortableDataTable columns={columns} data={categories} onReorder={onReorder} />
}
