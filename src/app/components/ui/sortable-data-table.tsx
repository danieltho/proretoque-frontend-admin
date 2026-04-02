import { useMemo, useState } from 'react'
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

interface SortableDataTableProps<TData extends { id: number }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onReorder: (reorderedData: TData[]) => void
}

function SortableRow<TData extends { id: number }>({
  row,
}: {
  row: import('@tanstack/react-table').Row<TData>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.original.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style} data-state={row.getIsSelected() && 'selected'}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
          {cell.column.id === 'drag' ? (
            <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </span>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function SortableDataTable<TData extends { id: number }, TValue>({
  columns,
  data,
  onReorder,
}: SortableDataTableProps<TData, TValue>) {
  const [items, setItems] = useState(data)

  // Sync external data changes
  const dataKey = data.map((d) => d.id).join(',')
  const [prevKey, setPrevKey] = useState(dataKey)
  if (dataKey !== prevKey) {
    setItems(data)
    setPrevKey(dataKey)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const rowIds = useMemo(() => items.map((item) => item.id), [items])

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)
    onReorder(reordered)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => <SortableRow key={row.id} row={row} />)
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  )
}
