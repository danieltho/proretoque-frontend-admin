import { lazy } from 'react'
import { Route } from 'react-router-dom'

const QuotePage = lazy(() => import('@/page/Quote/QuotePage'))

export default function QuoteRoutes() {
  return [<Route key="quotepage" path="/quotes" element={<QuotePage />} />]
}
