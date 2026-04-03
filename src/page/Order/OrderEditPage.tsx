import Template from '@/app/components/Template'
import { Input } from '@/app/components/ui/input'
import { FormSearchableSelect } from '@/app/components/ui/searchable-select'
import { useOrderForm } from '@/app/core/order/hooks/useOrderForm'
import { useOrderClients } from '@/app/core/order/hooks/useOrderClients'
import Card from '@/app/shared/ui/Card'
import { FormFieldCard } from '@/app/shared/ui/forms/FormFieldCard'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { useTranslation } from 'react-i18next'
import { PlusCircleIcon } from '@phosphor-icons/react'
import BatchDataTableSortable from '@/app/core/order/components/BatchDataTableSortable'
import ProviderTaskDataTable from '@/app/core/order/components/ProviderTaskDataTable'

export default function OrderEditPage() {
  const { t } = useTranslation()
  const { id, isNew, order, loading, error, form, batches, loadingBatches, handleSave, navigate } =
    useOrderForm()

  const customerId = form.watch('customer_id')
  const clientsHook = useOrderClients(customerId)

  const handleOriginalFilesAdded = (files: FileList | null) => {
    if (files) addImages('original', files)
  }

  const handleResourceFilesAdded = (files: FileList | null) => {
    if (files) addImages('resource', files)
  }

  const handleSampleFilesAdded = (files: FileList | null) => {
    if (files) addImages('sample', files)
  }

  return (
    <Template>
      <div className="flex flex-col gap-4">
        <header>
          <TitleSection
            title={isNew ? t('order.create') : t('order.detail')}
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
                </>
              )
            }
          />
        </header>
        <Card>
          <FormFieldCard label="Nombre pedido">
            <Input placeholder="Pedido de Prueba 1" {...form.register('name')} />
          </FormFieldCard>
          <div className="flex items-start gap-5">
            <FormFieldCard label="Cliente" className="flex-1">
              <FormSearchableSelect
                control={form.control}
                name="customer_id"
                options={clientsHook.options}
                searchValue={clientsHook.search}
                onSearch={clientsHook.setSearch}
                hasMore={clientsHook.hasMore}
                onLoadMore={clientsHook.loadMore}
                isLoading={clientsHook.loading}
                placeholder="Selecciona un cliente"
              />
            </FormFieldCard>

            <FormFieldCard label="Deadline" className="flex-1">
              <Input type="date" {...form.register('deadline')} />
            </FormFieldCard>
          </div>
        </Card>
        <Card>
          <BatchDataTableSortable />
        </Card>
        <Card>
          <ProviderTaskDataTable />
        </Card>
      </div>
    </Template>
  )
}
