import { lazy } from 'react'
import { Route } from 'react-router-dom'

const RolePage = lazy(() => import('@/page/Role/RolePage'))
const RoleRestrictionAccessPage = lazy(() => import('@/page/Role/RoleRestrictionAccessPage'))

export default function RoleRoutes() {
  return [
    <Route key="rolepage" path="/roles" element={<RolePage />} />,
    <Route key="role-restriction-access" path="/roles/:roleId/restriction-access" element={<RoleRestrictionAccessPage />} />,
  ]
}
