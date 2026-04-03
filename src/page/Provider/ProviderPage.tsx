import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatcher } from 'alova/client'
import { PlusCircleIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { getProvidersApi, deleteProviderApi } from '@/app/core/provider/api/providerApi'
import { ProvidersTable } from '@/app/core/provider/components/ProvidersTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Pagination } from '@/app/shared/ui/Pagination'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Input } from '@/app/components/ui/input'
import Template from '@/app/components/Template'
import { calculateTotalPage } from '@/app/shared/utils/pagination'
import { useTranslation } from 'react-i18next'

export default function ProviderPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const { t } = useTranslation()

  const { data, loading, error, send } = useWatcher(
    () => getProvidersApi(currentPage, search),
    [currentPage, search],
    { immediate: true, force: true },
  )

  const providers = data?.providers ?? []
  const totalCount = data?.count ?? 0
  const totalPages = calculateTotalPage(totalCount, data?.pages)

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteProviderApi(id).send()
      send()
    },
    [send],
  )

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value)
      setCurrentPage(1)
    },
    [],
  )

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          title="Proveedores"
          actions={[
            {
              label: 'Crear Proveedor',
              icon: PlusCircleIcon,
              onClick: () => navigate('/providers/new'),
              variant: 'blue',
            },
          ]}
        />

        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por username, nombre o email..."
            className="pl-9"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">{t('tables.empty')}</p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <ProvidersTable providers={providers} onDelete={handleDelete} />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </Template>
  )
}
