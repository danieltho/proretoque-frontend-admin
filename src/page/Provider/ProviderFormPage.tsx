import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Template from '@/app/components/Template'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import Card from '@/app/shared/ui/Card'
import { FormFieldCard } from '@/app/shared/ui/forms/FormFieldCard'
import { Input } from '@/app/components/ui/input'
import { Skeleton } from '@/app/components/ui/skeleton'
import { useProviderForm } from '@/app/core/provider/hooks/useProviderForm'

export default function ProviderFormPage() {
  const { t } = useTranslation()
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
          title={isNew ? t('forms.provider.createTitle') : t('forms.provider.editTitle')}
          onBack={() => navigate('/providers')}
          actions={[
            {
              label: t('actions.back'),
              onClick: () => navigate('/providers'),
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
            <FormFieldCard label={t('forms.provider.label.username')}>
              <Input placeholder={t('forms.provider.placeholder.username')} {...register('username')} />
              {errors.username && (
                <span className="text-sm text-error-text">{errors.username.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label={t('forms.provider.label.email')}>
              <Input type="email" placeholder={t('forms.provider.placeholder.email')} {...register('email')} />
              {errors.email && (
                <span className="text-sm text-error-text">{errors.email.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label={t('forms.provider.label.firstname')}>
              <Input placeholder={t('forms.provider.placeholder.firstname')} {...register('firstname')} />
              {errors.firstname && (
                <span className="text-sm text-error-text">{errors.firstname.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label={t('forms.provider.label.lastname')}>
              <Input placeholder={t('forms.provider.placeholder.lastname')} {...register('lastname')} />
              {errors.lastname && (
                <span className="text-sm text-error-text">{errors.lastname.message}</span>
              )}
            </FormFieldCard>

            <FormFieldCard label={t('forms.provider.label.company')}>
              <Input placeholder={t('forms.provider.placeholder.company')} {...register('company')} />
            </FormFieldCard>

            {isNew && (
              <FormFieldCard label={t('forms.provider.label.password')}>
                <Input type="password" placeholder={t('forms.provider.placeholder.password')} {...register('password')} />
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
