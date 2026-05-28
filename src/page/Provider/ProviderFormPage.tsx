import { useNavigate } from 'react-router-dom'
import Template from '@/app/components/Template'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import Card from '@/app/shared/ui/Card'
import { FormFieldCard } from '@/app/shared/ui/forms/FormFieldCard'
import { Input } from '@/app/components/ui/input'
import { Skeleton } from '@/app/components/ui/skeleton'
import { useProviderForm } from '@/app/core/provider/hooks/useProviderForm'

export default function ProviderFormPage() {
  const navigate = useNavigate()
  const { isNew, form, loading, handleSave } = useProviderForm()
  const { register, formState: { errors } } = form

  if (loading) {
    return (
      <Template>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Template>
    )
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          title={isNew ? 'Nuevo Proveedor' : 'Editar Proveedor'}
          onBack={() => navigate('/providers')}
          actions={[
            {
              label: 'Volver',
              onClick: () => navigate('/providers'),
              variant: 'ghost',
            },
            {
              label: 'Guardar',
              onClick: handleSave,
              variant: 'blue',
            },
          ]}
        />

        <Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormFieldCard label="Username" error={errors.username?.message}>
              <Input placeholder="username" {...register('username')} />
            </FormFieldCard>

            <FormFieldCard label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="email@ejemplo.com" {...register('email')} />
            </FormFieldCard>

            <FormFieldCard label="Nombre" error={errors.firstname?.message}>
              <Input placeholder="Nombre" {...register('firstname')} />
            </FormFieldCard>

            <FormFieldCard label="Apellidos" error={errors.lastname?.message}>
              <Input placeholder="Apellidos" {...register('lastname')} />
            </FormFieldCard>

            <FormFieldCard label="Compañía">
              <Input placeholder="Compañía (opcional)" {...register('company')} />
            </FormFieldCard>

            {isNew && (
              <FormFieldCard label="Contraseña" error={errors.password?.message}>
                <Input type="password" placeholder="Mínimo 6 caracteres" {...register('password')} />
            </FormFieldCard>
            )}
          </div>
        </Card>
      </div>
    </Template>
  )
}
