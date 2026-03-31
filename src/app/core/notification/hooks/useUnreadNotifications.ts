import { useCallback, useEffect, useState } from 'react'
import { useNotificationStore } from '@/app/stores/notificationStore'
import { getUnreadNotificationsApi } from '../api/notificationsApi'
import type { Notification } from '../types/notification'

interface UseUnreadNotificationsReturn {
  notifications: Notification[]
  loading: boolean
  refetch: () => Promise<void>
}

export function useUnreadNotifications(): UseUnreadNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getUnreadNotificationsApi()
      const data = Array.isArray(response) ? response : []
      setNotifications(data)
      setUnreadCount(data.length)
    } catch (error) {
      console.error('Error fetching unread notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [setUnreadCount])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    loading,
    refetch: fetchNotifications,
  }
}
