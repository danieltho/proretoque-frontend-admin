import alovaInstance from '@/app/shared/api/alovaInstance'
import type { NotificationsListResponse, UnreadNotificationsResponse } from '../types/notification'

export const getNotificationsApi = (page: number) =>
  alovaInstance.Get<NotificationsListResponse>('/notifications', { params: { page } })

export const getUnreadNotificationsApi = () =>
  alovaInstance.Get<UnreadNotificationsResponse>('/notifications/unread')

export const markNotificationAsReadApi = (id: string) =>
  alovaInstance.Patch(`/notifications/${id}/read`)

export const markAllNotificationsAsReadApi = () => alovaInstance.Patch('/notifications/read-all')
