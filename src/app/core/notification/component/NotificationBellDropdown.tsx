import { Link } from 'react-router-dom'
import { formatDateTime } from '@/app/shared/utils/date'
import type { Notification } from '../types/notification'

// ---------------------------------------------------------------------------
// NotificationBellDropdown — displays recent notifications in a dropdown
// ---------------------------------------------------------------------------

interface NotificationBellDropdownProps {
  notifications: Notification[]
  onClickNotification: (notification: Notification) => void
  onClickViewAll: () => void
}

export function NotificationBellDropdown({
  notifications,
  onClickNotification,
  onClickViewAll,
}: NotificationBellDropdownProps) {
  const recentNotifications = notifications.slice(0, 3)

  return (
    <>
      <div className="max-h-80 overflow-y-auto">
        {recentNotifications.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No tienes notificaciones</div>
        ) : (
          <div className="overflow-hidden">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => onClickNotification(notification)}
                className="cursor-pointer border-b px-4 py-3 hover:bg-gray-50 last:border-b-0"
              >
                <div className="text-sm font-medium">{notification.data.message}</div>
                <div className="text-xs text-gray-500">
                  {formatDateTime(notification.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t bg-gray-50 px-4 py-3">
        <Link
          to="/notifications"
          onClick={onClickViewAll}
          className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Ver todas las notificaciones
        </Link>
      </div>
    </>
  )
}
