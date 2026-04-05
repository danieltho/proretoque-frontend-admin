import { useCallback, useEffect, useState } from 'react'
import { useWatcher } from 'alova/client'
import { PlusCircleIcon } from '@phosphor-icons/react'
import {
  getRolesApi,
  getRoleAccessListApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
} from '@/app/core/role/api/roleApi'
import { RolesTable } from '@/app/core/role/components/RolesTable'
import { RoleCreateBar } from '@/app/core/role/components/RoleCreateBar'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Pagination } from '@/app/shared/ui/Pagination'
import { Skeleton } from '@/app/components/ui/skeleton'
import Template from '@/app/components/Template'
import type { SearchableSelectOption } from '@/app/components/ui/searchable-select'

export default function RolePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateBar, setShowCreateBar] = useState(false)
  const [accessOptions, setAccessOptions] = useState<SearchableSelectOption[]>([])

  // Load access options
  useEffect(() => {
    getRoleAccessListApi()
      .send()
      .then((res) => {
        setAccessOptions(
          res.role_access.map((a) => ({ id: a.id, label: a.name })),
        )
      })
  }, [])

  const { data, loading, error, send } = useWatcher(
    () => getRolesApi(currentPage),
    [currentPage],
    { immediate: true, force: true },
  )

  const roles = data?.roles ?? []
  const totalPages = data?.pages ?? 1

  const handleCreate = useCallback(
    async (name: string, accessIds: number[]) => {
      await createRoleApi({ name, access: accessIds }).send()
      setShowCreateBar(false)
      send()
    },
    [send],
  )

  const handleUpdate = useCallback(
    async (id: number, name: string, accessIds: number[]) => {
      await updateRoleApi(id, { name, access: accessIds }).send()
      send()
    },
    [send],
  )

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteRoleApi(id).send()
      send()
    },
    [send],
  )

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          breadcrumbs={[{ label: 'Administrador' }]}
          title="Roles de Usuarios"
          action={{
            label: 'Crear Nuevo',
            icon: PlusCircleIcon,
            onClick: () => setShowCreateBar((prev) => !prev),
            variant: 'blue',
          }}
        />

        {showCreateBar && (
          <RoleCreateBar accessOptions={accessOptions} onSubmit={handleCreate} />
        )}

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        {loading && roles.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : roles.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No hay roles registrados.</p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl bg-white p-4">
              <RolesTable
                roles={roles}
                accessOptions={accessOptions}
                onUpdate={handleUpdate}
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
