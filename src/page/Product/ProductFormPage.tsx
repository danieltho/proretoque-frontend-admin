import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PlusCircleIcon } from '@phosphor-icons/react'
import Template from '@/app/components/Template'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import Card from '@/app/shared/ui/Card'
import { FormFieldCard } from '@/app/shared/ui/forms/FormFieldCard'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { FormSearchableSelect } from '@/app/components/ui/searchable-select'
import { SortableDataTable } from '@/app/components/ui/sortable-data-table'
import { Skeleton } from '@/app/components/ui/skeleton'
import { useProductForm } from '@/app/core/product/hooks/useProductForm'
import { getProductItemColumns } from '@/app/core/product/components/productItemColumns'
import { ProductItemModal } from '@/app/core/product/components/ProductItemModal'
import type { ProductItem } from '@/app/core/product/types/product'
import type { ProductFormData } from '@/app/core/product/schema/productSchema'

const PRODUCT_TYPES = [
  { value: 'choice', label: 'Choice' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'input', label: 'Input' },
]

export default function ProductFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    isNew,
    form,
    loading,
    items,
    itemsError,
    categoryOptions,
    addItem,
    removeItem,
    reorderItems,
    updateItem,
    updateItemField,
    handleSave,
  } = useProductForm()

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form

  const productType = watch('type')

  // Item modal state
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null)

  const handleOpenNewItem = () => {
    setEditingItem(null)
    setItemModalOpen(true)
  }

  const handleEditItem = (item: ProductItem) => {
    setEditingItem(item)
    setItemModalOpen(true)
  }

  const handleSaveItem = (data: Omit<ProductItem, 'id' | 'sort_order'>) => {
    if (editingItem) {
      updateItem(editingItem.id, data)
    } else {
      addItem(data)
    }
  }

  const itemColumns = useMemo(
    () =>
      getProductItemColumns({
        t,
        onEdit: handleEditItem,
        onDelete: removeItem,
        onUpdateField: updateItemField,
      }),
    [t, removeItem, updateItemField],
  )

  if (loading) {
    return (
      <Template>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Template>
    )
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          title={isNew ? 'Nuevo Producto' : 'Editar Producto'}
          onBack={() => navigate('/products')}
          actions={[
            {
              label: 'Volver',
              onClick: () => navigate('/products'),
              variant: 'ghost',
            },
            {
              label: 'Guardar',
              onClick: handleSave,
              variant: 'blue',
            },
          ]}
        />

        {/* Form Card */}
        <Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Left column */}
            <div className="flex flex-col gap-4">
              <FormFieldCard label="Nombre del producto" error={errors.name?.message}>
                <Input placeholder="Introducir nombre de producto..." {...register('name')} />
            </FormFieldCard>

              <FormFieldCard label="Descripcion">
                <Textarea
                  placeholder="Escribe tus observaciones"
                  className="min-h-35"
                  {...register('description')}
                />
              </FormFieldCard>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormFieldCard label="Categoria" error={errors.category_ids?.message}>
                  <FormSearchableSelect<ProductFormData>
                    control={control}
                    name="category_ids"
                    multiple
                    options={categoryOptions}
                    placeholder="Seleccione una categoria"
                  />
            </FormFieldCard>

                <FormFieldCard label="Tipo" error={errors.type?.message}>
                  <Select
                    value={watch('type')}
                    onValueChange={(val) => form.setValue('type', val, { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
            </FormFieldCard>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormFieldCard label="Precio" error={errors.price?.message}>
                  <Input type="number" step="0.01" placeholder="$0.00" {...register('price', { valueAsNumber: true })} />
            </FormFieldCard>

                <FormFieldCard label="Tiempo" error={errors.time?.message}>
                  <Input type="number" placeholder="0" {...register('time', { valueAsNumber: true })} />
            </FormFieldCard>
              </div>
            </div>
          </div>
        </Card>

        {/* Items Card - only when type is 'choice' */}
        {productType === 'choice' && (
          <Card>
            <TitleSection
              title="Items"
              action={{
                label: 'Agregar',
                variant: 'outline',
                onClick: handleOpenNewItem,
                icon: PlusCircleIcon,
              }}
            />

            {itemsError && (
              <span className="text-sm text-error-text">{itemsError}</span>
            )}

            {items.length > 0 && (
              <SortableDataTable columns={itemColumns} data={items} onReorder={reorderItems} />
            )}
          </Card>
        )}
      </div>

      {/* Item Modal */}
      <ProductItemModal
        open={itemModalOpen}
        item={editingItem}
        onClose={() => setItemModalOpen(false)}
        onSave={handleSaveItem}
      />
    </Template>
  )
}
