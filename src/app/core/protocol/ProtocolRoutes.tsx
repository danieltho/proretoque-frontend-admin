import { lazy } from 'react'
import { Route } from 'react-router-dom'

const ProtocolPage = lazy(() => import('@/page/Protocol/ProtocolPage'))

export default function ProtocolRoutes() {
  return [
    <Route key="protocolpage" path="/protocols" element={<ProtocolPage />} />,
  ]
}
