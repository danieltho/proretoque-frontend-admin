import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/app/components/ui/data-table'
import type { OrderAdminProvider, ProviderStatus } from '../types/orderDetailType'

const STATUS_LABELS: Record<ProviderStatus, { label: string; className: string }> = {
  en_proceso: {
    label: 'EN PROCESO',
    className: 'bg-blue-50 text-white',
  },
  finalizado: {
    label: 'FINALIZADO',
    className: 'bg-green-100 text-white',
  },
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
        const config = STATUS_LABELS[status]
        return (
          <div key={status} className="flex flex-col gap-1">
            <span
              className={`inline-flex w-fit items-center rounded-lg px-2.5 py-0.5 text-footer font-medium ${config.className}`}
            >
              {config.label}
            </span>
            <DataTable columns={columns} data={items} />
          </div>
        )
      })}
    </div>
  )
}
