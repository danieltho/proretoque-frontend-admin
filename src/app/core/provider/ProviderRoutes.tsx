import { lazy } from 'react'
import { Route } from 'react-router-dom'

const ProviderPage = lazy(() => import('@/page/Provider/ProviderPage'))

export default function ProviderRoutes() {
  return [<Route key="providerpage" path="/providers" element={<ProviderPage />} />]
}
