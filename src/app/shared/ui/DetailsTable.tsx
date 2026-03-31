import { cn } from '@/app/shared/utils/utils'

export interface DetailRow {
  label: string
  value: string | null | undefined
}

interface DetailsTableProps {
  rows: DetailRow[]
  className?: string
}

export function DetailsTable({ rows, className }: DetailsTableProps) {
  const visibleRows = rows.filter((r) => r.value != null && r.value !== '')

  if (visibleRows.length === 0) return null

  return (
    <div className={cn('flex flex-col gap-2.5 font-[Raleway,sans-serif]', className)}>
      {visibleRows.map((row) => (
        <div key={row.label} className="flex items-center justify-between text-base">
          <span className="font-semibold">{row.label}</span>
          <span className="font-normal">{row.value}</span>
        </div>
      ))}
    </div>
  )
}
