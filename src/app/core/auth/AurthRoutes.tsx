import { lazy } from 'react'
import { Route } from 'react-router-dom'

const LoginPage = lazy(() => import('@/page/Auth/LoginPage'))


export default function AuthRoutes() {
  return [
    <Route key="loginpage" path="/login" element={<LoginPage />} />
  ]
}
