import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRequest } from 'alova/client'
import { getOrderDetail, updateOrderAdminApi } from '../api/orderApi'
import type { OrderDetailType } from '../types/orderDetailType'
import type { OrderAdminStatus } from '../types/orderAdmin'
import { formatDateShort } from '@/app/shared/utils/date'
import { parseRouteId } from '@/app/shared/utils/routeId'

const ORDER_STATUSES: [OrderAdminStatus, ...OrderAdminStatus[]] = [
  'created',
  'pending',
  'completed',
  'sended',
  'archived',
]

const orderFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  customer_id: z.number({ error: 'El cliente es requerido' }),
  status: z.enum(ORDER_STATUSES, { error: 'El estado es requerido' }),
  payment_method: z.string().optional(),
  deadline: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'La fecha no es válida',
    })
    .optional(),
})

export type OrderFormData = z.infer<typeof orderFormSchema>

export function useOrderForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id
  const routeId = parseRouteId(id)

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      name: '',
      customer_id: undefined,
      status: 'created',
      payment_method: '',
      deadline: '',
    },
  })

  // Edit mode con un id inválido en la URL (ej. /orders/abc/edit) → volver al listado.
  useEffect(() => {
    if (!isNew && routeId === null) navigate('/orders')
  }, [isNew, routeId, navigate])

  const {
    data: order,
    loading,
    error,
  } = useRequest(() => getOrderDetail(routeId ?? 0), {
    immediate: !isNew && routeId !== null,
    initialData: undefined as OrderDetailType | undefined,
  })

  /* const { data: batches, loading: loadingBatches } = useRequest(
    () => getOrderAdminBatchesApi(Number(id!)),
    {
      immediate: !isNew,
      initialData: { batches: [], count: 0, pages: 0 } as Batches,
    },
  ) */

  useEffect(() => {
    if (order) {
      form.reset({
        name: order.name,
        customer_id: order.customer_id,
        status: order.status,
        //payment_method: order.payment_method ?? '',
        deadline: formatDateShort(order.deadline ?? ''),
      })
    }
  }, [order, form])

  const handleSave = form.handleSubmit(async (data) => {
    if (isNew || routeId === null) return
    await updateOrderAdminApi(routeId, {
      name: data.name,
      customer_id: data.customer_id,
      status: data.status,
      payment_method: data.payment_method || undefined,
      deadline: data.deadline || undefined,
    }).send()
    // aplicar para mostrar el el alert que se guardo | creo el pedido
    navigate('/orders')
  })

  return {
    id,
    isNew,
    order,
    loading,
    error,
    form,
    // batches,
    // loadingBatches,
    handleSave,
    navigate,
  }
}
