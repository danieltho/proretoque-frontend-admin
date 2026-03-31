import { lazy } from 'react'
import { Route } from 'react-router-dom'

const DashboardPage = lazy(() => import('@/page/Dashboard/DashboardPage'))


export default function DashboardRoutes() {
  return [
    <Route key="dashboardpage" path="/" element={<DashboardPage />} />
  ]
}
