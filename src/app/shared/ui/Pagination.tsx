import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages: (number | 'ellipsis')[] = [1]
  if (currentPage > 3) pages.push('ellipsis')
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (currentPage < totalPages - 2) pages.push('ellipsis')
  if (totalPages > 1) pages.push(totalPages)
  return pages
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { t } = useTranslation()

  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center gap-1">
      <button
        className="flex h-9 items-center gap-1 rounded-md px-3 py-2 text-body font-medium text-neutral-600 cursor-pointer disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <CaretLeftIcon  />
        {t('pagination.previous')}
      </button>

      {getVisiblePages(currentPage, totalPages).map((page, idx) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex size-9 items-center justify-center text-body text-neutral-600"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            className={`flex size-9 items-center justify-center rounded-md text-body font-medium cursor-pointer ${
              page === currentPage
                ? 'bg-blue-200 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ),
      )}

      <button
        className="flex h-9 items-center gap-1 rounded-md px-3 py-2 text-body font-medium text-neutral-600 cursor-pointer disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {t('pagination.next')}
        <CaretRightIcon />
      </button>
    </nav>
  )
}
