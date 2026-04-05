import { lazy } from 'react'
import { Route } from 'react-router-dom'

const RolePage = lazy(() => import('@/page/Role/RolePage'))

export default function RoleRoutes() {
  return [<Route key="rolepage" path="/roles" element={<RolePage />} />]
}
