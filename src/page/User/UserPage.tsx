import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatcher } from 'alova/client'
import { PlusCircleIcon } from '@phosphor-icons/react'
import { getUsersApi, deleteUserApi } from '@/app/core/user/api/userApi'
import { UsersTable } from '@/app/core/user/components/UsersTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Pagination } from '@/app/shared/ui/Pagination'
import { Skeleton } from '@/app/components/ui/skeleton'
import Template from '@/app/components/Template'
import type { SearchableSelectOption } from '@/app/components/ui/searchable-select'

const ROLE_OPTIONS: SearchableSelectOption[] = [
  { id: 'admin', label: 'Admin' },
  { id: 'proveedor', label: 'Proveedor' },
]

export default function UserPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  const { data, loading, error, send } = useWatcher(
    () =>
      getUsersApi(currentPage, {
        name: search || undefined,
        roles: selectedRoles.length > 0 ? selectedRoles : undefined,
      }),
    [currentPage, search, selectedRoles],
    { immediate: true, force: true, debounce: [0, 300, 0] },
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

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }, [])

  const handleRolesChange = useCallback((roles: string[]) => {
    setSelectedRoles(roles)
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

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        {loading && users.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <UsersTable
                users={users}
                search={search}
                onSearchChange={handleSearchChange}
                roleOptions={ROLE_OPTIONS}
                selectedRoles={selectedRoles}
                onRolesChange={handleRolesChange}
                onDelete={handleDelete}
              />
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
