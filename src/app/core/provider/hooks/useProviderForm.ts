import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  providerSchema,
  providerCreateSchema,
  type ProviderFormData,
} from '../schema/providerSchema'
import {
  getProviderApi,
  createProviderApi,
  updateProviderApi,
} from '../api/providerApi'

export function useProviderForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const [loading, setLoading] = useState(!isNew)

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(isNew ? providerCreateSchema : providerSchema),
    defaultValues: {
      username: '',
      firstname: '',
      lastname: '',
      email: '',
      company: '',
      password: '',
    },
  })

  useEffect(() => {
    if (isNew || !id) return
    setLoading(true)
    getProviderApi(Number(id))
      .send()
      .then((res) => {
        const p = res.provider
        form.reset({
          username: p.username,
          firstname: p.firstname,
          lastname: p.lastname,
          email: p.email,
          company: p.company ?? '',
          password: '',
        })
      })
      .finally(() => setLoading(false))
  }, [id, isNew, form])

  const handleSave = useCallback(
    form.handleSubmit(async (data) => {
      if (isNew) {
        await createProviderApi({
          username: data.username,
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          company: data.company || undefined,
          password: data.password!,
        }).send()
      } else {
        await updateProviderApi(Number(id), {
          username: data.username,
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          company: data.company || undefined,
        }).send()
      }
      navigate('/providers')
    }),
    [id, isNew, form, navigate],
  )

  return { id, isNew, form, loading, handleSave }
}
