import { NotificationRow } from './NotificationRow'
import type { Notification } from '../types/notification'

// ---------------------------------------------------------------------------
// NotificationsTable — displays list of notifications or empty state
// ---------------------------------------------------------------------------

interface NotificationsTableProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationsTable({
  notifications,
  onMarkAsRead,
  onDelete,
}: NotificationsTableProps) {
  if (notifications.length === 0) {
    return <div className="py-8 text-center text-gray-500">No tienes notificaciones</div>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {notifications.map((notification) => (
        <NotificationRow
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
