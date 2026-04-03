import { lazy } from 'react'
import { Route } from 'react-router-dom'

const ProviderPage = lazy(() => import('@/page/Provider/ProviderPage'))
const ProviderFormPage = lazy(() => import('@/page/Provider/ProviderFormPage'))

export default function ProviderRoutes() {
  return [
    <Route key="providerpage" path="/providers" element={<ProviderPage />} />,
    <Route key="providernew" path="/providers/new" element={<ProviderFormPage />} />,
    <Route key="provideredit" path="/providers/:id" element={<ProviderFormPage />} />,
  ]
}
