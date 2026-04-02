import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/app/components/ui/data-table'
import type { OrderAdminProvider, ProviderStatus } from '../types/orderDetailType'

const STATUS_LABELS: Record<ProviderStatus, string> = {
  en_proceso: 'EN PROCESO',
  finalizado: 'FINALIZADO',
}

interface ProviderGroupTableProps {
  providers: OrderAdminProvider[]
  columns: ColumnDef<OrderAdminProvider, unknown>[]
}

export function ProviderGroupTable({ providers, columns }: ProviderGroupTableProps) {
  const grouped = providers.reduce<Record<ProviderStatus, OrderAdminProvider[]>>(
    (acc, provider) => {
      const status = provider.status ?? 'en_proceso'
      if (!acc[status]) acc[status] = []
      acc[status].push(provider)
      return acc
    },
    {} as Record<ProviderStatus, OrderAdminProvider[]>,
  )

  const statusOrder: ProviderStatus[] = ['en_proceso', 'finalizado']

  return (
    <div className="flex w-full flex-col gap-4">
      {statusOrder.map((status) => {
        const items = grouped[status]
        if (!items || items.length === 0) return null
        return (
          <div key={status} className="flex flex-col gap-1">
            <span className="inline-flex w-fit items-center rounded-lg bg-neutral-100 px-2.5 py-0.5 text-footer font-medium text-blue-200">
              {STATUS_LABELS[status]}
            </span>
            <DataTable columns={columns} data={items} />
          </div>
        )
      })}
    </div>
  )
}
