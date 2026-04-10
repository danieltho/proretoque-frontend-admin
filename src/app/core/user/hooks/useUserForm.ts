import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema, userCreateSchema, type UserFormData } from '../schema/userSchema'
import { getUserApi, createUserApi, updateUserApi } from '../api/userApi'

export function useUserForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id
  const [loading, setLoading] = useState(!isNew)

  const form = useForm<UserFormData>({
    resolver: zodResolver(isNew ? userCreateSchema : userSchema),
    defaultValues: {
      email: '',
      firstname: '',
      lastname: '',
      document: '',
      birth_date: '',
      hire_date: '',
      address: '',
      role: '',
      password: '',
      password_confirmation: '',
    },
  })

  useEffect(() => {
    if (isNew || !id) return
    setLoading(true)
    getUserApi(Number(id))
      .send()
      .then((res) => {
        form.reset({
          email: res.email,
          firstname: res.firstname,
          lastname: res.lastname,
          document: res.document ?? '',
          birth_date: res.birth_date ?? '',
          hire_date: res.hire_date ?? '',
          address: res.address ?? '',
          role: res.role?.id ? String(res.role.id) : '',
          password: '',
          password_confirmation: '',
        })
      })
      .finally(() => setLoading(false))
  }, [id, isNew, form])

  const handleSave = useCallback(() => {
    const onSubmit = async (values: UserFormData) => {
      if (isNew) {
        await createUserApi({
          email: values.email,
          password: values.password!,
          password_confirmation: values.password_confirmation!,
          firstname: values.firstname,
          lastname: values.lastname,
          document: values.document || undefined,
          birth_date: values.birth_date || undefined,
          hire_date: values.hire_date || undefined,
          address: values.address || undefined,
          role: values.role,
        }).send()
      } else {
        const payload: Record<string, string | undefined> = {
          email: values.email,
          firstname: values.firstname,
          lastname: values.lastname,
          document: values.document || undefined,
          birth_date: values.birth_date || undefined,
          hire_date: values.hire_date || undefined,
          address: values.address || undefined,
          role: values.role,
        }
        if (values.password) {
          payload.password = values.password
          payload.password_confirmation = values.password_confirmation
        }
        await updateUserApi(Number(id), payload).send()
      }
      navigate('/users')
    }

    form.handleSubmit(onSubmit as never)()
  }, [id, isNew, form, navigate])

  return { id, isNew, form, loading, handleSave }
}
