import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatcher } from 'alova/client'
import { getOrdersApi, deleteOrderApi } from '../../api/ordersApi'
import { formatDateShort } from '@/shared/utils/date'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Skeleton } from '@/app/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'
import {
  PlusCircle,
  ChatText,
  DotsThreeOutlineVertical,
  ClipboardText,
  Clock,
  XCircle,
  CheckCircle,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react'
import type { Order, BatchProductInfo } from '../../types/order'
import Template from '@/app/components/Template'

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock }> = {
  draft: { label: 'Borrador', icon: ClipboardText },
  created: { label: 'Creado', icon: PlusCircle },
  pending: { label: 'En Proceso', icon: Clock },
  processing: { label: 'En Proceso', icon: Clock },
  rejected: { label: 'Rechazado', icon: XCircle },
  completed: { label: 'Entregado', icon: CheckCircle },
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? { label: status, icon: Clock }
}

function getOrderTotalPrice(order: Order): string {
  let total = 0
  for (const batch of order.batches) {
    if (batch.products) {
      for (const product of batch.products) {
        if ('price' in product) {
          total += (product as BatchProductInfo).price
        }
      }
    }
  }
  if (total === 0) return '-'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total / 100)
}

function getOrderDeadline(order: Order): string {
  if (!order.deadline) return '-'
  return order.deadline
}

const ITEMS_PER_PAGE = 20

export default function OrdersListPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [mutationError, setMutationError] = useState('')

  const { data, loading, error, send } = useWatcher(
    () => getOrdersApi(currentPage, ITEMS_PER_PAGE),
    [currentPage],
    { immediate: true, force: true },
  )

  const orders = data?.orders ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

  const handleDelete = async (id: number) => {
    try {
      await deleteOrderApi(id).send()
      send()
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Error al eliminar pedido')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getVisiblePages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | 'ellipsis')[] = [1]
    if (currentPage > 3) pages.push('ellipsis')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('ellipsis')
    if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          breadcrumbs={[{ label: 'Inicio' }, { label: 'Pedidos' }]}
          title="Pedidos"
          action={{
            label: 'Crear Nuevo',
            icon: PlusCircle,
            onClick: () => navigate('/orders/new'),
          }}
        />

        {(error || mutationError) && (
          <p className="text-sm text-destructive">{error?.message || mutationError}</p>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No hay pedidos aun. Crea uno nuevo para empezar.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="w-15 text-footer font-semibold text-neutral-600">
                      #ID
                    </TableHead>
                    <TableHead className="text-footer font-semibold text-neutral-600">
                      Creado
                    </TableHead>
                    <TableHead className="text-footer font-semibold text-neutral-600">
                      Nombre
                    </TableHead>
                    <TableHead className="text-footer font-semibold text-neutral-600">
                      Tiempo
                    </TableHead>
                    <TableHead className="text-footer font-semibold text-neutral-600">
                      Lotes
                    </TableHead>
                    <TableHead className="text-footer font-semibold text-neutral-600">
                      Archivos
                    </TableHead>
                    <TableHead className="text-footer font-semibold text-neutral-600">
                      Precio
                    </TableHead>
                    <TableHead className="text-footer font-semibold text-neutral-600">
                      Pago
                    </TableHead>
                    <TableHead className="text-footer font-semibold text-neutral-600">
                      Estado
                    </TableHead>
                    <TableHead className="w-25" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status)
                    const StatusIcon = statusConfig.icon
                    return (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer border-b border-border hover:bg-neutral-100"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <TableCell className="w-15 text-footer font-medium text-neutral-600">
                          {order.number}
                        </TableCell>
                        <TableCell className="text-footer font-medium text-neutral-600">
                          {formatDateShort(order.created)}
                        </TableCell>
                        <TableCell className="text-footer font-medium text-neutral-600">
                          {order.name}
                        </TableCell>
                        <TableCell className="text-footer font-medium text-neutral-600">
                          {getOrderDeadline(order)}
                        </TableCell>
                        <TableCell className="text-footer font-medium text-neutral-600">
                          {order.batches?.length ?? 0}
                        </TableCell>
                        <TableCell className="text-footer font-medium text-neutral-600">
                          {order.count}
                        </TableCell>
                        <TableCell className="text-footer font-medium text-neutral-600">
                          {getOrderTotalPrice(order)}
                        </TableCell>
                        <TableCell className="text-footer font-medium text-neutral-600">
                          -
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="size-4 text-neutral-350" />
                            <span className="text-footer font-medium text-neutral-350">
                              {statusConfig.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              type="button"
                              className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/orders/${order.id}`)
                              }}
                            >
                              <ChatText className="size-6" />
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <DotsThreeOutlineVertical className="size-6" weight="fill" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/orders/${order.id}`)
                                  }}
                                >
                                  Ver detalle
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(order.id)
                                  }}
                                >
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <nav className="flex items-center gap-1">
                <button
                  className="flex h-9 items-center gap-1 rounded-md px-3 py-2 text-body font-medium text-neutral-600 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <CaretLeft className="size-4" />
                  Previous
                </button>

                {getVisiblePages().map((page, idx) =>
                  page === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex size-9 items-center justify-center text-body text-neutral-600"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`flex size-9 items-center justify-center rounded-md text-body font-medium ${
                        page === currentPage
                          ? 'bg-blue-200 text-white shadow-sm'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  className="flex h-9 items-center gap-1 rounded-md px-3 py-2 text-body font-medium text-neutral-600 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                  <CaretRight className="size-4" />
                </button>
              </nav>
            )}
          </div>
        )}
      </div>
    </Template>
  )
}
