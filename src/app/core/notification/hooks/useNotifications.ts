import { useEffect, useState } from 'react'
import { useNotificationStore } from '@/app/stores/notificationStore'
import {
  getNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from '../api/notificationsApi'
import type { Notification } from '../types/notification'

// ---------------------------------------------------------------------------
// useNotifications — fetches and manages paginated notifications
// ---------------------------------------------------------------------------

interface UseNotificationsReturn {
  notifications: Notification[]
  loading: boolean
  page: number
  lastPage: number
  filter: string
  setFilter: (value: string) => void
  goToPage: (page: number) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [filter, setFilter] = useState('')
  const decrementUnreadCount = useNotificationStore((state) => state.decrementUnreadCount)

  const fetchNotifications = async (pageNum: number) => {
    try {
      setLoading(true)
      const response = await getNotificationsApi(pageNum)
      const data = Array.isArray(response.data) ? response.data : []
      setNotifications(data)
      setLastPage(response.meta?.last_page ?? 1)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications(1)
  }, [])

  const goToPage = (pageNum: number) => {
    fetchNotifications(pageNum)
  }

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsReadApi(id)
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read_at: new Date().toISOString() } : notif,
        ),
      )
      decrementUnreadCount()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsReadApi()
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          read_at: new Date().toISOString(),
        })),
      )
      // Reset unread count to 0 by calling resetUnreadCount
      const { resetUnreadCount } = useNotificationStore.getState()
      resetUnreadCount()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      // TODO: implement delete API call when backend provides endpoint
      setNotifications((prev) => prev.filter((notif) => notif.id !== id))
      const deletedNotif = notifications.find((n) => n.id === id)
      if (deletedNotif && deletedNotif.read_at === null) {
        decrementUnreadCount()
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  return {
    notifications,
    loading,
    page,
    lastPage,
    filter,
    setFilter,
    goToPage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
