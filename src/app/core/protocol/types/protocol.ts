export type ProtocolAdminStatus = 'creado' | 'en_revision' | 'aprobado'

export interface ProtocolAdmin {
  id: number
  name: string
  images_count: number
  created_at: string
  status: ProtocolAdminStatus
}

export interface ProtocolsAdminListResponse {
  protocols: ProtocolAdmin[]
  count: number
  page: number
}
