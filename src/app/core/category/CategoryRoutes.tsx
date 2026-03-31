import { lazy } from 'react'
import { Route } from 'react-router-dom'

const CategoryPage = lazy(() => import('@/page/Category/CategoryPage'))

export default function CategoryRoutes() {
  return [
    <Route key="categorypage" path="/categories" element={<CategoryPage />} />,
  ]
}
