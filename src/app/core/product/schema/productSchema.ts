import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category_ids: z.array(z.number()).min(1, 'Seleccione al menos una categoría'),
  type: z.string().min(1, 'Seleccione un tipo'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  time: z.number().min(0, 'El tiempo debe ser mayor o igual a 0'),
})

export type ProductFormData = z.infer<typeof productSchema>
