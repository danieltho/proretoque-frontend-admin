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
          <div className="grid grid-cols-2 gap-4">
            <FormFieldCard label="Username">
              <Input placeholder="username" {...register('username')} />
              {errors.username && (
                <span className="text-sm text-error-text">{errors.username.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label="Email">
              <Input type="email" placeholder="email@ejemplo.com" {...register('email')} />
              {errors.email && (
                <span className="text-sm text-error-text">{errors.email.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label="Nombre">
              <Input placeholder="Nombre" {...register('firstname')} />
              {errors.firstname && (
                <span className="text-sm text-error-text">{errors.firstname.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label="Apellidos">
              <Input placeholder="Apellidos" {...register('lastname')} />
              {errors.lastname && (
                <span className="text-sm text-error-text">{errors.lastname.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label="Compañía">
              <Input placeholder="Compañía (opcional)" {...register('company')} />
            </FormFieldCard>

            {isNew && (
              <FormFieldCard label="Contraseña">
                <Input type="password" placeholder="Mínimo 6 caracteres" {...register('password')} />
                {errors.password && (
                  <span className="text-sm text-error-text">{errors.password.message}</span>
                )}
              </FormFieldCard>
            )}
          </div>
        </Card>
      </div>
    </Template>
  )
}
