import { z } from 'zod/v4'

export const userLoginSchema = z.object({
  email: z.string().nonempty('El email es requerido').email('Email inválido'),
  password: z.string().nonempty('La contraseña es requerida'),
})

export type UserLoginFormData = z.infer<typeof userLoginSchema>
