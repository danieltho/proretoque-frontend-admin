import { z } from 'zod'

export const userSchema = z
  .object({
    email: z.string().min(1, 'El email es requerido').email('Email inválido'),
    firstname: z.string().min(1, 'El nombre es requerido'),
    lastname: z.string().min(1, 'El apellido es requerido'),
    document: z.string().optional(),
    birth_date: z.string().optional(),
    hire_date: z.string().optional(),
    address: z.string().optional(),
    role: z.string().min(1, 'Seleccione un rol'),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
  })
  .refine(
    (data) => !data.password || data.password === data.password_confirmation,
    { message: 'Las contraseñas no coinciden', path: ['password_confirmation'] },
  )

export const userCreateSchema = z
  .object({
    email: z.string().min(1, 'El email es requerido').email('Email inválido'),
    firstname: z.string().min(1, 'El nombre es requerido'),
    lastname: z.string().min(1, 'El apellido es requerido'),
    document: z.string().optional(),
    birth_date: z.string().optional(),
    hire_date: z.string().optional(),
    address: z.string().optional(),
    role: z.string().min(1, 'Seleccione un rol'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    password_confirmation: z.string().min(1, 'Confirme la contraseña'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  })

export type UserFormData = z.infer<typeof userSchema>
