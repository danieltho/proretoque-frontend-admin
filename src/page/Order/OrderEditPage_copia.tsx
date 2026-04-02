import { useCallback } from 'react'
import {
  PlusCircleIcon,
  ChatTextIcon,
  DownloadSimpleIcon,
} from '@phosphor-icons/react'
import { formatDateShort } from '@/app/shared/utils/date'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Pagination } from '@/app/shared/ui/Pagination'
import { SortableDataTable } from '@/app/components/ui/sortable-data-table'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { Skeleton } from '@/app/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/app/components/ui/combobox'
import Template from '@/app/components/Template'
import { OrderAdminStatusBadge } from '@/app/core/order/components/OrderAdminStatusBadge'
import { CouponSection } from '@/app/core/order/components/CouponSection'
import { CostSummary } from '@/app/core/order/components/CostSummary'
import { ProviderGroupTable } from '@/app/core/order/components/ProviderGroupTable'
import { useOrderForm } from '@/app/core/order/hooks/useOrderForm'
import { useOrderClients } from '@/app/core/order/hooks/useOrderClients'
import { useOrderAdminBatches } from '@/app/core/order/hooks/useOrderAdminBatches'
import { useOrderAdminProviders } from '@/app/core/order/hooks/useOrderAdminProviders'
import { formatFileSize } from '@/app/shared/utils/fileSize'

function formatCurrency(amount: number | null): string {
  if (amount == null) return '--'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

export default function OrderEditPage() {
  const {
    id,
    isNew,
    order,
    loading,
    error,
    orderName,
    setOrderName,
    customerId,
    setCustomerId,
    paymentMethod,
    setPaymentMethod,
    deadline,
    setDeadline,
    handleSave,
    navigate,
    batches,
    loadingBatches
  } = useOrderForm()

  const {
    clients,
    setSearch: setClientSearch,
    selectedClient,
    handleSelect: handleClientSelect,
    loading: loadingClients,
    hasMore: hasMoreClients,
    loadMore: loadMoreClients,
  } = useOrderClients(customerId)

  const handleClientListScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
        loadMoreClients()
      }
    },
    [loadMoreClients],
  )

  
  const providers = order?.providers ?? []

  const {
    columns: batchColumns,
    page: batchPage,
    setPage: setBatchPage,
    totalPages: batchTotalPages,
    handleReorder,
  } = useOrderAdminBatches()

  const { columns: providerColumns } = useOrderAdminProviders()

  if (!isNew && loading) {
    return (
      <Template>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Template>
    )
  }

  if (!isNew && error) {
    return (
      <Template>
        <p className="text-sm text-destructive">{error.message}</p>
      </Template>
    )
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        {/* Title Section */}
        <TitleSection
          breadcrumbs={[
            { label: 'Inicio' },
            { label: 'Pedidos' },
            { label: isNew ? 'Nuevo Pedido' : 'Detalle del Pedido' },
          ]}
          title={isNew ? 'Nuevo Pedido' : order?.name ?? ''}
          onBack={() => navigate('/orders')}
          actions={[
            {
              label: 'Volver',
              onClick: () => navigate('/orders'),
              variant: 'ghost',
            },
            {
              label: 'Guardar',
              onClick: handleSave,
              variant: 'blue',
            },
          ]}
          description={
            order && (
              <>
                <span>
                  <span className="font-semibold">Número:</span> #{order.number}
                </span>
                <span>
                  <span className="font-semibold">Creado:</span>
                  {formatDateShort(order.created_at)}
                </span>
                <span>
                  <span className="font-semibold">Deadline:</span>
                  {order.deadline ? formatDateShort(order.deadline) : '--'}
                </span>
                <span>
                  <span className="font-semibold">Lotes:</span> {order.batch_count}
                </span>
                <span>
                  <span className="font-semibold">Tamaño:</span> {formatFileSize(order.file_size)}
                </span>
                <span>
                  <span className="font-semibold">Nro. Fotos:</span> {order.file_count}
                </span>
              
                <span className="flex items-center gap-1 p-2.5">
                  <span className="font-semibold">Estado:</span>
                  <OrderAdminStatusBadge status={order.status} />
                </span>
                <span className="flex items-center gap-2.5 p-2.5">
                  <button
                    type="button"
                    className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  >
                    <ChatTextIcon  />
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer text-neutral-600 hover:text-neutral-350"
                  >
                    <DownloadSimpleIcon />
                  </button>
                </span>
              </>
            )
          }
        />

        {/* Client Selector — full width */}
        <div className="rounded-2xl bg-white p-4">
          <Combobox
            value={customerId}
            onValueChange={(val) => {
              setCustomerId(val as number)
              const client = clients.find((c) => c.id === val)
              if (client) handleClientSelect(client)
            }}
            onInputValueChange={(val) => setClientSearch(val)}
            filter={null}
          >
            <ComboboxInput
              placeholder={
                selectedClient
                  ? `${selectedClient.firstname} ${selectedClient.lastname} | ${selectedClient.username}`
                  : 'Seleccionar cliente...'
              }
              className="w-full"
            />
            <ComboboxContent>
              <ComboboxList onScroll={handleClientListScroll}>
                <ComboboxEmpty>
                  {loadingClients ? 'Buscando...' : 'Sin resultados.'}
                </ComboboxEmpty>
                {clients.map((client) => (
                  <ComboboxItem key={client.id} value={client.id}>
                    {client.firstname} {client.lastname} | {client.username}
                  </ComboboxItem>
                ))}
                {loadingClients && hasMoreClients && (
                  <div className="py-2 text-center text-sm text-neutral-400">
                    Cargando más...
                  </div>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        {/* Order Name + Deadline */}
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1.5 rounded-2xl bg-white p-4">
            <label className="text-body font-medium text-neutral-600">Nombre del Pedido</label>
            <Input
              placeholder="Nombre del Pedido"
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
            />
          </div>
          <div className="flex w-48 flex-col gap-1.5 rounded-2xl bg-white p-4">
            <label className="text-body font-medium text-neutral-600">Deadline</label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        {/* Resumen de Lotes */}
        {order && (
          <div className="flex flex-col items-center gap-2.5 rounded-2xl bg-white p-4">
            <div className="flex w-full items-center justify-between">
              <TitleSection title='Resumen de Lotes' actions={[
             { label: 'Agregar Lote',
              onClick: handleSave,
              icon: PlusCircleIcon, 
              variant: 'blue',}
            ]} />
              
            </div>
            <SortableDataTable columns={batchColumns} data={batches.batches} onReorder={handleReorder} />
            <Pagination
              currentPage={batchPage}
              totalPages={batchTotalPages}
              onPageChange={setBatchPage}
            />
          </div>
        )}

        {/* Proveedores — grouped by status */}
        {order && (
          <div className="flex flex-col items-center gap-2.5 rounded-2xl bg-white p-4">
            <div className="flex w-full items-center justify-between">
              <h2 className="text-h2 font-semibold text-neutral-600">Proveedores</h2>
              <Button variant="outline">
                <PlusCircleIcon />
                Agregar Proveedores
              </Button>
            </div>
            <ProviderGroupTable providers={providers} columns={providerColumns} />
          </div>
        )}

        {/* Coupon & Cost Summary */}
        {order && (
          <div className="flex items-start justify-between rounded-2xl bg-white p-4">
            <CouponSection
              couponName={order.coupon_name}
              onApply={() => {}}
              onRemove={() => {}}
            />
            <CostSummary
              discount={order.discount}
              couponName={order.coupon_name}
              subtotal={order.subtotal}
              iva={order.iva}
              total={order.total}
            />
          </div>
        )}

        {/* Método de Pago */}
        <div className="flex flex-col gap-2.5 rounded-2xl bg-white p-4">
          <h2 className="text-h2 font-semibold text-neutral-600">Método de Pago</h2>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar método de pago" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transfer">Transferencia bancaria</SelectItem>
              <SelectItem value="card">Tarjeta de crédito</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Template>
  )
}
