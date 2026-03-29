import { z } from 'zod/v4'

export const loginSchema = z.object({
  username: z.string().nonempty('El email es requerido'),
  password: z.string().nonempty('La contraseña es requerida'),
})

export const registerSchema = z
  .object({
    username: z.string().nonempty('El nombre de usuario es requerido'),
    email: z.string().nonempty('El email es requerido').email('Email inválido'),
    password: z.string().nonempty('La contraseña es requerida').min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string().nonempty('Confirma tu contraseña'),
    phone: z.string().optional(),
    country_iso: z.string().optional(),
    privacy_accepted: z.literal(true, { message: 'Debes aceptar la Política de Privacidad' }),
    terms_accepted: z.literal(true, { message: 'Debes aceptar los Términos y Condiciones' }),
    newsletter: z.boolean().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  })

export const userLoginSchema = z.object({
  email: z.string().nonempty('El email es requerido').email('Email inválido'),
  password: z.string().nonempty('La contraseña es requerida'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type UserLoginFormData = z.infer<typeof userLoginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
