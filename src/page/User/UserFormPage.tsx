import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    getRolesApi(1)
      .send()
      .then((res) => {
        setRoleOptions(res.roles.map((r) => ({ value: r.name, label: r.name })))
      })
  }, [])
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
          <div className="grid grid-cols-2 gap-4">
            <FormFieldCard label="Email">
              <Input type="email" placeholder="email@ejemplo.com" {...register('email')} />
              {errors.email && (
                <span className="text-sm text-error-text">{errors.email.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label="Rol">
              <Select
                value={watch('role')}
                onValueChange={(val) => setValue('role', val, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full" aria-invalid={!!errors.role}>
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
              {errors.role && (
                <span className="text-sm text-error-text">{errors.role.message}</span>
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

            <FormFieldCard label="Contraseña">
              <Input
                type="password"
                placeholder={isNew ? 'Mínimo 6 caracteres' : 'Dejar vacío para no cambiar'}
                {...register('password')}
              />
              {errors.password && (
                <span className="text-sm text-error-text">{errors.password.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label="Confirmar contraseña">
              <Input
                type="password"
                placeholder="Confirmar contraseña"
                {...register('password_confirmation')}
              />
              {errors.password_confirmation && (
                <span className="text-sm text-error-text">
                  {errors.password_confirmation.message}
                </span>
              )}
            </FormFieldCard>
          </div>
        </Card>
      </div>
    </Template>
  )
}
