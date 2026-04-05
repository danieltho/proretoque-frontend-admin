import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatcher } from 'alova/client'
import { PlusCircleIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { getUsersApi, deleteUserApi } from '@/app/core/user/api/userApi'
import { UsersTable } from '@/app/core/user/components/UsersTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Pagination } from '@/app/shared/ui/Pagination'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Input } from '@/app/components/ui/input'
import Template from '@/app/components/Template'

export default function UserPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, loading, error, send } = useWatcher(
    () => getUsersApi(currentPage, { name: search || undefined }),
    [currentPage, search],
    { immediate: true, force: true, debounce: [0, 300] },
  )

  const users = data?.users ?? []
  const totalPages = data?.pages ?? 1

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteUserApi(id).send()
      send()
    },
    [send],
  )

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }, [])

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          breadcrumbs={[{ label: 'Administrador' }]}
          title="Usuarios"
          action={{
            label: 'Crear Nuevo',
            icon: PlusCircleIcon,
            onClick: () => navigate('/users/new'),
            variant: 'blue',
          }}
        />

        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="pl-9"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        {loading && users.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No hay usuarios registrados.</p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <UsersTable users={users} onDelete={handleDelete} />
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
