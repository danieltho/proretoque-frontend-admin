// ---------------------------------------------------------------------------
// NotificationBadge — displays unread count or nothing
// ---------------------------------------------------------------------------

interface NotificationBadgeProps {
  count: number
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count === 0) {
    return null
  }

  const displayCount = count > 9 ? '9+' : count

  return (
    <span className="absolute right-0 top-0 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
      {displayCount}
    </span>
  )
}
