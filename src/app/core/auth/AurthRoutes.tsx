import { lazy } from 'react'
import { Route } from 'react-router-dom'

const LoginPage = lazy(() => import('@/page/Auth/LoginPage'))
const RegisterPage = lazy(() => import('@/page/Auth/RegisterPage'))

export default function AuthRoutes() {
  return [
    <Route key="loginpage" path="/login" element={<LoginPage />} />,
    <Route key="registerpage" path="/register" element={<RegisterPage />} />,
  ]
}
