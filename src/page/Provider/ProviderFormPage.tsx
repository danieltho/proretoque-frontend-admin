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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormFieldCard label={t('forms.provider.label.username')} error={errors.username?.message}>
              <Input placeholder={t('forms.provider.placeholder.username')} {...register('username')} />
            </FormFieldCard>

            <FormFieldCard label={t('forms.provider.label.email')} error={errors.email?.message}>
              <Input type="email" placeholder={t('forms.provider.placeholder.email')} {...register('email')} />
            </FormFieldCard>

            <FormFieldCard label={t('forms.provider.label.firstname')} error={errors.firstname?.message}>
              <Input placeholder={t('forms.provider.placeholder.firstname')} {...register('firstname')} />
            </FormFieldCard>

            <FormFieldCard label={t('forms.provider.label.lastname')} error={errors.lastname?.message}>
              <Input placeholder={t('forms.provider.placeholder.lastname')} {...register('lastname')} />
            </FormFieldCard>

            <FormFieldCard label={t('forms.provider.label.company')}>
              <Input placeholder={t('forms.provider.placeholder.company')} {...register('company')} />
            </FormFieldCard>

            {isNew && (
              <FormFieldCard label={t('forms.provider.label.password')} error={errors.password?.message}>
                <Input type="password" placeholder={t('forms.provider.placeholder.password')} {...register('password')} />
            </FormFieldCard>
            )}
          </div>
        </Card>
      </div>
    </Template>
  )
}
