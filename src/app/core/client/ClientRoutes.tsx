import { lazy } from 'react'
import { Route } from 'react-router-dom'

const ClientPage = lazy(() => import('@/page/Client/ClientPage'))

export default function ClientRoutes() {
  return [
    <Route key="clientpage" path="/clients" element={<ClientPage />} />,
  ]
}
