import { useEffect, useState } from 'react'
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
import { parseRouteId } from '@/app/shared/utils/routeId'

export function useProviderForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const routeId = parseRouteId(id)
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
    if (isNew) return
    if (routeId === null) {
      navigate('/providers')
      return
    }
    setLoading(true)
    getProviderApi(routeId)
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
  }, [id, isNew, routeId, navigate, form])

  const handleSave = form.handleSubmit(async (data) => {
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
      if (routeId === null) {
        navigate('/providers')
        return
      }
      await updateProviderApi(routeId, {
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        company: data.company || undefined,
      }).send()
    }
    navigate('/providers')
  })

  return { id, isNew, form, loading, handleSave }
}
