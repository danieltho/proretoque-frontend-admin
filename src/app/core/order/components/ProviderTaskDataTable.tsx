import { PlusCircleIcon } from '@phosphor-icons/react'
import { useOrderAdminProviders } from '../hooks/useOrderAdminProviders'
import { ProviderGroupTable } from './ProviderGroupTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Skeleton } from '@/app/components/ui/skeleton'

export default function ProviderTaskDataTable() {
  const { providers, columns, loading } = useOrderAdminProviders()

  return (
    <>
      <header>
        <TitleSection
          title="Proveedores"
          actions={[
            {
              label: 'Agregar Proveedores',
              onClick: () => {
                // TODO: open provider selector modal
              },
              icon: PlusCircleIcon,
              variant: 'outline',
            },
          ]}
        />
      </header>

      {loading && providers.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No hay proveedores asignados
        </p>
      ) : (
        <ProviderGroupTable providers={providers} columns={columns} />
      )}
    </>
  )
}
