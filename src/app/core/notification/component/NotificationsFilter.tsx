// ---------------------------------------------------------------------------
// NotificationsFilter — search input for filtering notifications
// ---------------------------------------------------------------------------

interface NotificationsFilterProps {
  value: string
  onChange: (value: string) => void
}

export function NotificationsFilter({ value, onChange }: NotificationsFilterProps) {
  return (
    <input
      type="search"
      role="searchbox"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Buscar notificaciones..."
      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
    />
  )
}
