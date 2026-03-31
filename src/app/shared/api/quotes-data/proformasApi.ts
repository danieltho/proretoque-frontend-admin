import alovaInstance from '@/app/shared/api/alovaInstance'

export interface Proforma {
  id: number
  name: string
  number: string
  quote_id: number | null
  notes: string | null
  date_from: string
  date_to: string | null
  active: boolean
  customer_id: number
  created_at: string
  updated_at: string
}

export interface CreateProformaPayload {
  name: string
  number: string
  quote_id?: number
  date_from: string
  notes?: string
}

export const createProformaApi = (data: CreateProformaPayload) =>
  alovaInstance.Post<{ proforma: Proforma }>('/proformas', data)
