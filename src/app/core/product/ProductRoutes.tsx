import { lazy } from 'react'
import { Route } from 'react-router-dom'

const ProductPage = lazy(() => import('@/page/Product/ProductPage'))
const ProductFormPage = lazy(() => import('@/page/Product/ProductFormPage'))

export default function ProductRoutes() {
  return [
    <Route key="productpage" path="/products" element={<ProductPage />} />,
    <Route key="productnew" path="/products/new" element={<ProductFormPage />} />,
    <Route key="productform" path="/products/:id/edit" element={<ProductFormPage />} />,
  ]
}
