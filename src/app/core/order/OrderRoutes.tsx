import { lazy } from 'react'
import { Route } from 'react-router-dom'

const OrderPage = lazy(() => import('@/page/Order/OrderPage'))
const OrderAdminEditPage = lazy(
  () => import('@/page/Order/OrderEditPage'),
)

export default function OrderRoutes() {
  return [
    <Route key="orderpage" path="/orders" element={<OrderPage />} />,
    <Route key="order-new" path="/orders/new" element={<OrderAdminEditPage />} />,
    <Route key="order-edit" path="/orders/:id/edit" element={<OrderAdminEditPage />} />,
  ]
}
