import { lazy } from 'react'
import { Route } from 'react-router-dom'

const OrderPage = lazy(() => import('@/page/Order/OrderPage'))

export default function OrderRoutes() {
  return [
    <Route key="orderpage" path="/orders" element={<OrderPage />} />,
  ]
}
