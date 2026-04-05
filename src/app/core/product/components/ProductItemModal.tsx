import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InfoIcon } from '@phosphor-icons/react'
import DialogModal from '@/app/shared/ui/DialogModal'
import { FormFieldCard } from '@/app/shared/ui/forms/FormFieldCard'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Button } from '@/app/components/ui/button'
import type { ProductItem } from '../types/product'

const itemSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  tooltip: z.string().optional(),
  description_provider: z.string().optional(),
  description_postpro: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  duration_task: z.number().min(0, 'El tiempo debe ser mayor o igual a 0'),
})

type ItemFormData = z.infer<typeof itemSchema>

interface ProductItemModalProps {
  open: boolean
  item: ProductItem | null
  onClose: () => void
  onSave: (data: Omit<ProductItem, 'id' | 'sort_order'>) => void
}

export function ProductItemModal({ open, item, onClose, onSave }: ProductItemModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      description: '',
      tooltip: '',
      description_provider: '',
      description_postpro: '',
      price: 0,
      duration_task: 0,
    },
  })

  useEffect(() => {
    if (!open) return
    if (item) {
      reset({
        name: item.name,
        description: item.description ?? '',
        tooltip: item.tooltip ?? '',
        description_provider: item.description_provider ?? '',
        description_postpro: item.description_postpro ?? '',
        price: item.price,
        duration_task: item.duration_task,
      })
    } else {
      reset({
        name: '',
        description: '',
        tooltip: '',
        description_provider: '',
        description_postpro: '',
        price: 0,
        duration_task: 0,
      })
    }
  }, [open, item, reset])

  const onSubmit = (data: ItemFormData) => {
    onSave({
      name: data.name,
      description: data.description ?? '',
      tooltip: data.tooltip ?? '',
      description_provider: data.description_provider ?? '',
      description_postpro: data.description_postpro ?? '',
      price: data.price,
      duration_task: data.duration_task,
      lang: item?.lang || 'es',
    })
    onClose()
  }

  return (
    <DialogModal
      open={open}
      onClose={onClose}
      title={item ? 'Editar Item' : 'Nuevo Item'}
      size="fullScreen"
      showCloseButton={false}
    >
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto font-raleway">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-h1 font-bold">{item ? 'Editar Item' : 'Nuevo Item'}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="blue" size="sm" onClick={handleSubmit(onSubmit as never)}>
              Guardar
            </Button>
          </div>
        </div>

        {/* Language tab - only ES for now */}
        <div className="flex gap-2.5">
          <span className="rounded-lg border-b-2 border-blue-200 bg-[#F0F4FF] px-5 py-1.5 text-body font-semibold">
            ES
          </span>
        </div>

        {/* Form content */}
        <div className="flex gap-4">
          {/* Left section */}
          <div className="flex flex-1 flex-col gap-4">
            <FormFieldCard label="Nombre del producto">
              <Input placeholder="Introducir nombre de producto..." {...register('name')} />
              {errors.name && (
                <span className="text-sm text-error-text">{errors.name.message}</span>
              )}
            </FormFieldCard>

            <div className="grid grid-cols-2 gap-4">
              <FormFieldCard label="Descripcion">
                <Textarea
                  placeholder="Escribe tus observaciones"
                  className="min-h-28"
                  {...register('description')}
                />
              </FormFieldCard>

              <FormFieldCard label="Descripcion Tooltip">
                <Textarea
                  placeholder="Escribe tus observaciones"
                  className="min-h-28"
                  {...register('tooltip')}
                />
              </FormFieldCard>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormFieldCard label="Descripcion Proveedores">
                <Textarea
                  placeholder="Escribe tus observaciones"
                  className="min-h-28"
                  {...register('description_provider')}
                />
              </FormFieldCard>

              <FormFieldCard label="Descripcion PostPro">
                <Textarea
                  placeholder="Escribe tus observaciones"
                  className="min-h-28"
                  {...register('description_postpro')}
                />
              </FormFieldCard>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-neutral-200" />

          {/* Right section */}
          <div className="flex w-48 flex-col gap-4">
            <FormFieldCard label="Precio">
              <Input
                type="number"
                step="0.01"
                placeholder="$0.00"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <span className="text-sm text-error-text">{errors.price.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label="Tiempo">
              <Input
                type="number"
                placeholder="000"
                {...register('duration_task', { valueAsNumber: true })}
              />
              {errors.duration_task && (
                <span className="text-sm text-error-text">{errors.duration_task.message}</span>
              )}
              <span className="flex items-center gap-1 text-footer text-neutral-600 opacity-50">
                <InfoIcon className="size-4" />
                Introducir tiempo en segundos.
              </span>
            </FormFieldCard>
          </div>
        </div>
      </div>
    </DialogModal>
  )
}
