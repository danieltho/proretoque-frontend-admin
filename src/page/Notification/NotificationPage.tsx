import { useNotifications } from '@/application/notification/hooks/useNotifications'
import { NotificationsFilter } from '@/application/notification/component/NotificationsFilter'
import { NotificationsTable } from '@/application/notification/component/NotificationsTable'
import { NotificationsTableSkeleton } from '@/application/notification/component/NotificationsTableSkeleton'
import Template from '@/components/Template'
import { TitleSection } from '@/app/shared/ui/TitleSection'

// ---------------------------------------------------------------------------
// NotificationsPage — presentational page for notifications
// ---------------------------------------------------------------------------

export default function NotificationPage() {
  const {
    notifications,
    loading,
    page,
    lastPage,
    filter,
    setFilter,
    goToPage,
    markAsRead,
    deleteNotification,
  } = useNotifications()

  return (
    <Template>
      <TitleSection title="Notificaicones" />
      {notifications.length > 0 && <div className="text-3xl font-bold">Notificaciones</div>}

      <NotificationsFilter value={filter} onChange={setFilter} />

      {loading ? (
        <NotificationsTableSkeleton />
      ) : (
        <>
          {notifications.length === 0 && (
            <div className="py-8 text-center text-gray-500">No tienes notificaciones</div>
          )}

          {notifications.length > 0 && (
            <>
              <NotificationsTable
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />

              {lastPage > 1 && (
                <nav aria-label="Paginación" className="flex justify-center gap-2">
                  {[...Array(lastPage)].map((_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`rounded px-3 py-1 ${pageNum === page ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </nav>
              )}
            </>
          )}
        </>
      )}
    </Template>
  )
}
