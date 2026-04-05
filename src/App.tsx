import { Route, Routes } from 'react-router-dom'


import AuthGuard from './AuthGuard'
import AuthRoutes from '@/app/core/auth/AurthRoutes'
import DashboardRoutes from '@/app/core/dashboard/DashboardRoutes'
import ClientRoutes from '@/app/core/client/ClientRoutes'
import QuoteRoutes from '@/app/core/quote/QuoteRoutes'
import ProtocolRoutes from '@/app/core/protocol/ProtocolRoutes'
import OrderRoutes from '@/app/core/order/OrderRoutes'
import ProductRoutes from '@/app/core/product/ProductRoutes'
import CategoryRoutes from '@/app/core/category/CategoryRoutes'
import ProviderRoutes from '@/app/core/provider/ProviderRoutes'
import RoleRoutes from '@/app/core/role/RoleRoutes'

export default function App() {
  return (
    <div className="app-container">
      <Routes>
          {AuthRoutes()}
          <Route element={<AuthGuard />}>
            {DashboardRoutes()}
            {ClientRoutes()}
            {QuoteRoutes()}
            {ProtocolRoutes()}
            {OrderRoutes()}
            {ProductRoutes()}
            {CategoryRoutes()}
            {ProviderRoutes()}
            {RoleRoutes()}
          </Route>
      </Routes>
    </div>
  )
}
