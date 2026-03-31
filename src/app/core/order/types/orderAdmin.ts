export type OrderAdminStatus =
  | 'pendiente'
  | 'en_proceso'
  | 'muestras_aceptadas'
  | 'presupuesto_aceptado'

export type OrderAdminAction =
  | 'requiere_muestras'
  | 'muestras_enviadas'
  | 'requiere_presupuesto'
  | 'presupuesto_enviado'

export interface OrderAdmin {
  id: number
  number: string
  customer_name: string
  subtotal: number | null
  iva: number | null
  total: number | null
  created_at: string
  status: OrderAdminStatus
  status_date: string | null
  action: OrderAdminAction | null
}

export interface OrdersAdminListResponse {
  orders: OrderAdmin[]
  count: number
  pages: number
}
