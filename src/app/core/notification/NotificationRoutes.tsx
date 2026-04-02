import { lazy } from 'react'
import { Route } from 'react-router-dom'

const NotificationPage = lazy(() => import('@/page/Notification/NotificationPage'))

export default function NotificationRoutes() {
  return [<Route key="notificationList" path="/notifications" element={<NotificationPage />} />]
}
