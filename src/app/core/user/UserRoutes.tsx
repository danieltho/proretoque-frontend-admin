import { lazy } from 'react'
import { Route } from 'react-router-dom'

const UserPage = lazy(() => import('@/page/User/UserPage'))
const UserFormPage = lazy(() => import('@/page/User/UserFormPage'))

export default function UserRoutes() {
  return [
    <Route key="userpage" path="/users" element={<UserPage />} />,
    <Route key="usernew" path="/users/new" element={<UserFormPage />} />,
    <Route key="useredit" path="/users/:id/edit" element={<UserFormPage />} />,
  ]
}
