// ---------------------------------------------------------------------------
// NotificationsTableSkeleton — loading skeleton for notifications table
// ---------------------------------------------------------------------------

export function NotificationsTableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
      ))}
    </div>
  )
}
