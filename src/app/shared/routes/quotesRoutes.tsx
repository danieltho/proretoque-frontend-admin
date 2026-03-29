import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'

const QuotesListPageContainer = lazy(
  () => import('@/application/quote/list/containers/QuotesListPageContainer'),
)
const QuoteNewPage = lazy(() => import('@/application/quote/creation/pages/QuoteNewPage'))
const QuoteEditPage = lazy(() => import('@/application/quote/creation/pages/QuoteEditPage'))
const QuoteDetailContainer = lazy(
  () => import('@/application/quote/detail/containers/QuoteDetailContainer'),
)

// eslint-disable-next-line react-refresh/only-export-components
const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
)

export const quotesRoutes: RouteObject[] = [
  {
    path: '/quotes',
    element: (
      <Lazy>
        <QuotesListPageContainer />
      </Lazy>
    ),
  },
  {
    path: '/quotes/:id/detail',
    element: (
      <Lazy>
        <QuoteDetailContainer />
      </Lazy>
    ),
  },
  {
    path: '/quotes/new',
    element: (
      <Lazy>
        <QuoteNewPage />
      </Lazy>
    ),
  },
  {
    path: '/quotes/:id/edit',
    element: (
      <Lazy>
        <QuoteEditPage />
      </Lazy>
    ),
  },
]
