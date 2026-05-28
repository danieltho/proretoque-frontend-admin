import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
          title={isNew ? t('forms.user.createTitle') : t('forms.user.editTitle')}
          onBack={() => navigate('/users')}
          actions={[
            {
              label: t('actions.back'),
              onClick: () => navigate('/users'),
              variant: 'ghost',
            },
            {
              label: t('actions.save'),
              onClick: handleSave,
              variant: 'blue',
            },
          ]}
        />

        <Card>
          <div className="grid grid-cols-2 gap-4">
            <FormFieldCard label={t('forms.user.label.email')}>
              <Input type="email" placeholder={t('forms.user.placeholder.email')} {...register('email')} />
              {errors.email && (
                <span className="text-sm text-error-text">{errors.email.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label={t('forms.user.label.role')}>
              <Select
                value={watch('role')}
                onValueChange={(val) => setValue('role', val, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full" aria-invalid={!!errors.role}>
                  <SelectValue placeholder={t('forms.user.placeholder.role')} />
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

            <FormFieldCard label={t('forms.user.label.firstname')}>
              <Input placeholder={t('forms.user.placeholder.firstname')} {...register('firstname')} />
              {errors.firstname && (
                <span className="text-sm text-error-text">{errors.firstname.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label={t('forms.user.label.lastname')}>
              <Input placeholder={t('forms.user.placeholder.lastname')} {...register('lastname')} />
              {errors.lastname && (
                <span className="text-sm text-error-text">{errors.lastname.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label={t('forms.user.label.document')}>
              <Input placeholder={t('forms.user.placeholder.document')} {...register('document')} />
            </FormFieldCard>

            <FormFieldCard label={t('forms.user.label.address')}>
              <Input placeholder={t('forms.user.placeholder.address')} {...register('address')} />
            </FormFieldCard>

            <FormFieldCard label={t('forms.user.label.birth_date')}>
              <Input type="date" {...register('birth_date')} />
            </FormFieldCard>

            <FormFieldCard label={t('forms.user.label.hire_date')}>
              <Input type="date" {...register('hire_date')} />
            </FormFieldCard>

            <FormFieldCard label={t('forms.user.label.password')}>
              <Input
                type="password"
                placeholder={t(isNew ? 'forms.user.placeholder.password_new' : 'forms.user.placeholder.password_keep')}
                {...register('password')}
              />
              {errors.password && (
                <span className="text-sm text-error-text">{errors.password.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label={t('forms.user.label.password_confirmation')}>
              <Input
                type="password"
                placeholder={t('forms.user.placeholder.password_confirmation')}
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
