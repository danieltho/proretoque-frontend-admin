import { PlusCircleIcon } from '@phosphor-icons/react'
import { useOrderAdminProviders } from '../hooks/useOrderAdminProviders'
import { ProviderGroupTable } from './ProviderGroupTable'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { Skeleton } from '@/app/components/ui/skeleton'

export default function ProviderDataTable() {
  const { providers, columns, loading, handleAddProvider } = useOrderAdminProviders()

  if (loading && providers.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

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
                handleAddProvider(1)
              },
              icon: PlusCircleIcon,
              variant: 'outline',
            },
          ]}
        />
      </header>
      {providers.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No hay proveedores asignados
        </p>
      ) : (
        <ProviderGroupTable providers={providers} columns={columns} />
      )}
    </>
  )
}
