export type ProtocolAdminStatus = 'creado' | 'en_revision' | 'aprobado' | 'aceptado'

export interface ProtocolAdmin {
  id: number
  name: string
  code: string
  images_count: number
  created_at: string
  updated_at: string
  status: ProtocolAdminStatus
}

export interface ProtocolsAdminListResponse {
  protocols: ProtocolAdmin[]
  count: number
  pages: number
}
