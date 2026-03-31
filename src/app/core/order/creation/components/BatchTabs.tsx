import { useState, useRef, useLayoutEffect, useCallback } from 'react'
import {
  PencilIcon,
  XIcon,
  PlusIcon,
  PlusCircleIcon,
  CaretCircleDoubleUpIcon,
} from '@phosphor-icons/react'
import { Button } from '@/app/components/ui/button'
import { useOrderForm } from '../context/OrderFormContext'
import { truncateLabel } from '@/shared/utils/string'

interface Props {
  showRename?: boolean
  showRemove?: boolean
  showAdd?: boolean
}

export default function BatchTabs({
  showRename = false,
  showRemove = false,
  showAdd = false,
}: Props) {
  const { batches, activeBatchId, setActiveBatchId, addBatch, setEditingBatch, removeBatch } =
    useOrderForm()

  const [expanded, setExpanded] = useState(false)
  const [firstRowCount, setFirstRowCount] = useState(batches.length)
  const measureRef = useRef<HTMLDivElement>(null)

  const measure = useCallback(() => {
    const el = measureRef.current
    if (!el) return
    const tabs = Array.from(el.children) as HTMLElement[]
    if (!tabs.length) return
    const firstTop = tabs[0].offsetTop
    const count = tabs.filter((t) => t.offsetTop <= firstTop + 4).length
    setFirstRowCount(count)
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (measureRef.current) ro.observe(measureRef.current)
    return () => ro.disconnect()
  }, [batches.length, measure])

  const hasOverflow = firstRowCount < batches.length
  const hiddenCount = batches.length - firstRowCount
  const displayBatches = expanded || !hasOverflow ? batches : batches.slice(0, firstRowCount)

  return (
    <div className="relative">
      {/* Div invisible para medir wrapping — nunca visible ni interactuable */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute flex w-full flex-wrap items-center gap-2"
      >
        {batches.map((batch, i) => (
          <div
            key={batch.id}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm"
          >
            <span>
              {i + 1}. {truncateLabel(batch.name)}
            </span>
            {showRename && <span className="h-4.5 w-4.5" />}
            {showRemove && batches.length > 1 && <span className="h-4.5 w-4.5" />}
          </div>
        ))}
      </div>

      {/* Tabs visibles */}
      <div className="flex flex-wrap items-center gap-2">
        {displayBatches.map((batch, i) => (
          <button
            key={batch.id}
            type="button"
            onClick={() => setActiveBatchId(batch.id)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
              activeBatchId === batch.id
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-background border-border hover:bg-accent'
            }`}
          >
            <span>
              {i + 1}. {truncateLabel(batch.name)}
            </span>
            {showRename && (
              <PencilIcon
                size={18}
                weight="thin"
                className="opacity-60 hover:opacity-100"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  setEditingBatch(batch)
                }}
              />
            )}
            {showRemove && batches.length > 1 && (
              <XIcon
                size={18}
                weight="thin"
                className="opacity-60 hover:opacity-100"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  removeBatch(batch.id)
                }}
              />
            )}
          </button>
        ))}

        {!expanded && hasOverflow && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-dashed border-border bg-muted/40 transition-colors hover:bg-accent"
          >
            <PlusCircleIcon className="mr-1" size={18} /> {hiddenCount} lotes
          </button>
        )}

        {expanded && hasOverflow && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-dashed border-border bg-muted transition-colors hover:bg-accent"
          >
            <CaretCircleDoubleUpIcon className="mr-1" size={18} /> {hiddenCount} lotes
          </button>
        )}

        {showAdd && (
          <Button variant="outline" size="sm" onClick={addBatch}>
            <PlusIcon className="mr-1" weight="thin" size={18} /> Lote
          </Button>
        )}
      </div>
    </div>
  )
}
