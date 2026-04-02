import { useState } from 'react'
import { BellIcon } from '@phosphor-icons/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'
import { useNotificationStore } from '@/app/stores/notificationStore'
import { useUnreadNotifications } from '@/app/core/notification/hooks/useUnreadNotifications'
import { NotificationBadge } from '@/app/core/notification/component/NotificationBadge'
import { NotificationBellDropdown } from '@/app/core/notification/component/NotificationBellDropdown'

// ---------------------------------------------------------------------------
// NotificationBell — container component for bell icon and dropdown
// ---------------------------------------------------------------------------

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount } = useNotificationStore()
  const { notifications } = useUnreadNotifications()

  const handleClickNotification = () => {
    setIsOpen(false)
  }

  const handleClickViewAll = () => {
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button aria-label="Notificaciones" className="relative cursor-pointer">
          <BellIcon />
          <NotificationBadge count={unreadCount} />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0">
        <NotificationBellDropdown
          notifications={notifications}
          onClickNotification={handleClickNotification}
          onClickViewAll={handleClickViewAll}
        />
      </PopoverContent>
    </Popover>
  )
}
