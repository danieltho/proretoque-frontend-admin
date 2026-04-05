import { useCallback, useMemo, useRef, useState } from 'react'
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

export function CategoriesTable({
  categories,
  onUpdate,
  onDelete,
  onReorder,
}: CategoriesTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = useCallback((category: CategoryAdmin) => {
    setEditingId(category.id)
    setEditValue(category.name)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  const saveEdit = useCallback(() => {
    if (editingId == null) return
    const trimmed = editValue.trim()
    if (trimmed) {
      onUpdate(editingId, trimmed)
    }
    setEditingId(null)
    setEditValue('')
  }, [editingId, editValue, onUpdate])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditValue('')
  }, [])

  const columns: ColumnDef<CategoryAdmin>[] = useMemo(
    () => [
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
        cell: ({ row }) => {
          const isEditing = editingId === row.original.id
          if (isEditing) {
            return (
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  onBlur={saveEdit}
                  className="h-7 text-footer"
                />
              </div>
            )
          }
          return <span className="text-footer text-neutral-600">{row.original.name}</span>
        },
      },
      {
        id: 'actions',
        header: () => <span className="text-footer font-medium text-blue-200">ACCIONES</span>,
        cell: ({ row }) => {
          const isEditing = editingId === row.original.id
          return (
            <div className="flex items-center gap-2.5">
              {isEditing ? (
                <button
                  type="button"
                  className="cursor-pointer text-green-600 hover:text-green-500"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    saveEdit()
                  }}
                >
                  <CheckIcon className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  onClick={() => startEdit(row.original)}
                >
                  <NotePencilIcon className="size-4" />
                </button>
              )}
              <button
                type="button"
                className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                onClick={() => onDelete(row.original.id)}
              >
                <XIcon className="size-4" />
              </button>
            </div>
          )
        },
      },
    ],
    [editingId, editValue, saveEdit, cancelEdit, startEdit, onDelete],
  )

  return <SortableDataTable columns={columns} data={categories} onReorder={onReorder} />
}
