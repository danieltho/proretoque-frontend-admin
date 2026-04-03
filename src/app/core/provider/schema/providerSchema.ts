import { z } from 'zod'

export const providerSchema = z.object({
  username: z.string().min(1, 'El username es requerido'),
  firstname: z.string().min(1, 'El nombre es requerido'),
  lastname: z.string().min(1, 'El apellido es requerido'),
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  company: z.string().optional(),
  password: z.string().optional(),
})

export const providerCreateSchema = providerSchema.extend({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type ProviderFormData = z.infer<typeof providerSchema>
