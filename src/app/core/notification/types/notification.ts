// ---------------------------------------------------------------------------
// Notification types and interfaces
// ---------------------------------------------------------------------------

export interface NotificationData {
  action: string
  message: string
}

export interface Notification {
  id: string
  type: string
  data: NotificationData
  source_type: string | null
  source_id: number | null
  read_at: string | null
  created_at: string
}

export interface NotificationsListResponse {
  data: Notification[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

export type UnreadNotificationsResponse = Notification[]
