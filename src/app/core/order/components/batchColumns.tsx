import { useState, useRef, useEffect } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  NotePencilIcon,
  XIcon,
  DotsSixVerticalIcon,
  PencilSimpleIcon,
  CloudArrowUpIcon,
  ListPlusIcon,
  StackPlusIcon,
} from '@phosphor-icons/react'
import { Checkbox } from '@/app/components/ui/checkbox'
import { formatDateShort } from '@/app/shared/utils/date'
import type { OrderAdminBatch } from '../types/orderDetailType'
import { formatFileSize } from '@/app/shared/utils/fileSize'

function formatCurrency(amount: number | null): string {
  if (amount == null) return '--'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

function EditableNameCell({ value, onSave }: { value: string; onSave: (name: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setName(value)
  }, [value])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleSave = () => {
    setEditing(false)
    const trimmed = name.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    } else {
      setName(value)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') {
            setName(value)
            setEditing(false)
          }
        }}
        className="w-full rounded border border-blue-300 px-1.5 py-0.5 text-footer text-neutral-600 outline-none focus:ring-1 focus:ring-blue-300"
      />
    )
  }

  return (
    <span
      className="group flex cursor-pointer items-center gap-1.5"
      onClick={() => setEditing(true)}
    >
      <span className="text-footer text-neutral-600">{value}</span>
      <PencilSimpleIcon className="size-3.5 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" />
    </span>
  )
}

interface BatchColumnsOptions {
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onRename?: (id: number, name: string) => void
  onUploadFiles?: (batchId: number) => void
  onRetouches?: (batchId: number) => void
  onDeliveryOptions?: (batchId: number) => void
}

export function getBatchColumns({
  onEdit,
  onDelete,
  onRename,
  onUploadFiles,
  onRetouches,
  onDeliveryOptions,
}: BatchColumnsOptions): ColumnDef<OrderAdminBatch>[] {
  return [
    {
      id: 'drag',
      header: () => null,
      cell: () => <DotsSixVerticalIcon className="size-4 cursor-grab text-neutral-400" />,
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
      size: 50,
    },
    {
      accessorKey: 'name',
      header: () => <span className="text-footer font-medium text-blue-200">NOMBRE</span>,
      cell: ({ row }) =>
        onRename ? (
          <EditableNameCell
            value={row.original.name}
            onSave={(name) => onRename(row.original.id, name)}
          />
        ) : (
          <span className="text-footer text-neutral-600">{row.original.name}</span>
        ),
    },
    {
      accessorKey: 'file_count',
      header: () => <span className="text-footer font-medium text-blue-200">FOTOS</span>,
      cell: ({ row }) =>
        onUploadFiles ? (
          <span
            className="group flex cursor-pointer items-center gap-1.5"
            onClick={() => onUploadFiles(row.original.id)}
          >
            <span className="text-footer text-neutral-600">{row.original.file_count}</span>
            <CloudArrowUpIcon className="size-4 text-blue-200 opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
        ) : (
          <span className="text-footer text-neutral-600">{row.original.file_count}</span>
        ),
    },
    {
      accessorKey: 'retouch_count',
      header: () => <span className="text-footer font-medium text-blue-200">RETOQUES</span>,
      cell: ({ row }) =>
        onRetouches ? (
          <span
            className="group flex cursor-pointer items-center gap-1.5"
            onClick={() => onRetouches(row.original.id)}
          >
            <span className="text-footer text-neutral-600">{row.original.product_count}</span>
            <ListPlusIcon className="size-4 text-blue-200 opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
        ) : (
          <span className="text-footer text-neutral-600">{row.original.product_count}</span>
        ),
    },
    {
      accessorKey: 'size_count',
      header: () => <span className="text-footer font-medium text-blue-200">TAMAÑO TOTAL</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">
          {formatFileSize(row.original.size_count ?? 0)}
        </span>
      ),
    },
    {
      id: 'delivery',
      header: () => (
        <span className="text-footer font-medium text-blue-200">ENTREGA</span>
      ),
      cell: ({ row }) => {
        const { delivery_time, format, bit_depth, color_mode } = row.original
        const badges = [delivery_time, format, bit_depth, color_mode].filter(Boolean)

        return onDeliveryOptions ? (
          <span
            className="group flex cursor-pointer flex-wrap items-center gap-1"
            onClick={() => onDeliveryOptions(row.original.id)}
          >
            {badges.length > 0 ? (
              badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-lg bg-blue-200 px-2 py-0.5 text-[10px] font-medium text-white"
                >
                  {badge}
                </span>
              ))
            ) : (
              <span className="text-footer text-neutral-400">--</span>
            )}
            <StackPlusIcon className="size-4 text-blue-200 opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
        ) : (
          <span className="flex flex-wrap gap-1">
            {badges.length > 0 ? (
              badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-lg bg-blue-200 px-2 py-0.5 text-[10px] font-medium text-white"
                >
                  {badge}
                </span>
              ))
            ) : (
              <span className="text-footer text-neutral-400">--</span>
            )}
          </span>
        )
      },
    },
    {
      id: 'product_total_price',
      header: () => <span className="text-footer font-medium text-blue-200">PRECIO TOTAL</span>,
      cell: ({ row }) => (
        <span className="text-footer text-neutral-600">
          {formatCurrency(row.original.product_total_price)}
        </span>
      ),
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
