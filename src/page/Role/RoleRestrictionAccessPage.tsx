import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Checkbox } from '@/app/components/ui/checkbox'
import { getRoleApi, createRoleRestrictionAccessApi } from '@/app/core/role/api/roleApi'
import { TitleSection } from '@/app/shared/ui/TitleSection'
import { FormFieldCard } from '@/app/shared/ui/forms/FormFieldCard'
import Card from '@/app/shared/ui/Card'
import Template from '@/app/components/Template'

const restrictionSchema = z.object({
  only_provider: z.boolean(),
})

type RestrictionFormData = z.infer<typeof restrictionSchema>

export default function RoleRestrictionAccessPage() {
  const { roleId } = useParams<{ roleId: string }>()
  const navigate = useNavigate()
  const [roleName, setRoleName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RestrictionFormData>({
    resolver: zodResolver(restrictionSchema),
    defaultValues: { only_provider: false },
  })

  useEffect(() => {
    if (!roleId) return
    const id = Number(roleId)
    Promise.all([getRoleApi(id).send()])
      .then(([role]) => {
        setRoleName(role.name)
        reset({ only_provider: role?.restriction?.only_provider })
      })
      .finally(() => setLoading(false))
  }, [roleId])

  const onSubmit = async (values: RestrictionFormData) => {
    if (!roleId) return
    await createRoleRestrictionAccessApi(Number(roleId), {
      only_provider: values.only_provider ? 1 : 0,
    }).send()
  }

  return (
    <Template>
      <div className="flex flex-col gap-4 font-raleway">
        <TitleSection
          title={loading ? '' : `${roleName} — Restriction Access`}
          onBack={() => navigate('/roles')}
          actions={[
            {
              label: 'Volver',
              onClick: () => navigate('/roles'),
              variant: 'ghost',
            },
            {
              label: 'Guardar',
              onClick: handleSubmit(onSubmit),
              variant: 'blue',
            },
          ]}
        />

        <Card>
          <FormFieldCard label="">
            <Controller
              name="only_provider"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    disabled={isSubmitting}
                  />
                  <span className="text-sm">Aplica entorno de proveedor</span>
                </label>
              )}
            />
          </FormFieldCard>
        </Card>
      </div>
    </Template>
  )
}
