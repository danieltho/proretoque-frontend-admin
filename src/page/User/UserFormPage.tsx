import { useNavigate } from 'react-router-dom'
import { useRequest } from 'alova/client'
import Template from '@/app/components/Template'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import Card from '@/app/shared/ui/Card'
import { FormFieldCard } from '@/app/shared/ui/forms/FormFieldCard'
import { Input } from '@/app/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { Skeleton } from '@/app/components/ui/skeleton'
import { useUserForm } from '@/app/core/user/hooks/useUserForm'
import { getRolesApi } from '@/app/core/role/api/roleApi'

export default function UserFormPage() {
  const navigate = useNavigate()
  const { isNew, form, loading, handleSave } = useUserForm()

  const { data: rolesData } = useRequest(() => getRolesApi(1), { initialData: { roles: [] } })
  const roleOptions = rolesData.roles.map((r) => ({ value: String(r.id), label: r.name }))
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

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
          title={isNew ? 'Nuevo Usuario' : 'Editar Usuario'}
          onBack={() => navigate('/users')}
          actions={[
            {
              label: 'Volver',
              onClick: () => navigate('/users'),
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
            <FormFieldCard label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="email@ejemplo.com" {...register('email')} />
            </FormFieldCard>

            <FormFieldCard label="Rol" error={errors.role?.message}>
              <Select
                value={watch('role')}
                onValueChange={(val) => setValue('role', val, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldCard>

            <FormFieldCard label="Nombre" error={errors.firstname?.message}>
              <Input placeholder="Nombre" {...register('firstname')} />
            </FormFieldCard>

            <FormFieldCard label="Apellidos" error={errors.lastname?.message}>
              <Input placeholder="Apellidos" {...register('lastname')} />
            </FormFieldCard>

            <FormFieldCard label="Documento">
              <Input placeholder="Documento (opcional)" {...register('document')} />
            </FormFieldCard>

            <FormFieldCard label="Dirección">
              <Input placeholder="Dirección (opcional)" {...register('address')} />
            </FormFieldCard>

            <FormFieldCard label="Fecha de nacimiento">
              <Input type="date" {...register('birth_date')} />
            </FormFieldCard>

            <FormFieldCard label="Fecha de contratación">
              <Input type="date" {...register('hire_date')} />
            </FormFieldCard>

            <FormFieldCard label="Contraseña" error={errors.password?.message}>
              <Input
                type="password"
                placeholder={isNew ? 'Mínimo 6 caracteres' : 'Dejar vacío para no cambiar'}
                {...register('password')}
              />
            </FormFieldCard>

            <FormFieldCard label="Confirmar contraseña" error={errors.password_confirmation?.message}>
              <Input
                type="password"
                placeholder="Confirmar contraseña"
                {...register('password_confirmation')}
              />
            </FormFieldCard>
          </div>
        </Card>
      </div>
    </Template>
  )
}
