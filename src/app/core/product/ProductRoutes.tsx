import { lazy } from 'react'
import { Route } from 'react-router-dom'

const ProductPage = lazy(() => import('@/page/Product/ProductPage'))

export default function ProductRoutes() {
  return [
    <Route key="productpage" path="/products" element={<ProductPage />} />,
  ]
}
