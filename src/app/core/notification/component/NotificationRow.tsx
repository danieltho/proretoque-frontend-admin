import { Trash } from '@phosphor-icons/react'
import { NotificationActionBadge } from '@/app/core/notification/component/NotificationActionBadge'
import { formatDateShort } from '@/app/shared/utils/date'
import type { Notification } from '@/app/core/notification/types/notification'

interface NotificationRowProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationRow({ notification, onMarkAsRead, onDelete }: NotificationRowProps) {
  const isRead = notification.read_at !== null

  const formattedDate = formatDateShort(notification.created_at)

  const message = notification.data.message

  const handleRowClick = () => {
    if (!isRead) {
      onMarkAsRead(notification.id)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(notification.id)
  }

  return (
    <article
      data-read={isRead ? 'true' : 'false'}
      onClick={handleRowClick}
      className={`flex cursor-pointer items-center gap-4 border-b px-4 py-4 transition-colors hover:bg-gray-50 ${isRead ? 'bg-white text-gray-500' : 'bg-blue-50 font-medium'}`}
    >
      {!isRead && (
        <div data-testid="unread-indicator" className="h-2 w-2 rounded-full bg-blue-500" />
      )}

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span>{message}</span>
          <NotificationActionBadge actionType={notification.data.action} />
        </div>
        <div className="mt-1 text-xs text-gray-500">{formattedDate}</div>
      </div>

      <button
        onClick={handleDeleteClick}
        aria-label="Eliminar notificación"
        className="rounded p-2 hover:bg-gray-200"
      >
        <Trash size={18} />
      </button>
    </article>
  )
}
